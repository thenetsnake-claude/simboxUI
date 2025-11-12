import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageFolder } from '../../entities/message.entity';
import { PendingMessage } from '../../entities/pending-message.entity';
import { SMSEagleService } from '../smseagle/smseagle.service';
import { SendSmsDto } from './dto/send-sms.dto';
import { SendBinarySmsDto } from './dto/send-binary-sms.dto';
import { GetMessagesDto } from './dto/get-messages.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(PendingMessage)
    private pendingRepository: Repository<PendingMessage>,
    private smsEagleService: SMSEagleService,
  ) {}

  async getMessages(dto: GetMessagesDto) {
    const { folder, phone_number, page, limit, sort } = dto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .skip(skip)
      .take(limit)
      .orderBy('message.sending_date', sort === 'asc' ? 'ASC' : 'DESC')
      .addOrderBy('message.receive_date', sort === 'asc' ? 'ASC' : 'DESC');

    if (folder) {
      queryBuilder.andWhere('message.folder = :folder', { folder });
    }

    if (phone_number) {
      queryBuilder.andWhere('message.phone_number = :phone_number', { phone_number });
    }

    const [messages, total] = await queryBuilder.getManyAndCount();

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getConversations(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Get unique phone numbers with their latest message
    const conversations = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.phone_number', 'phone_number')
      .addSelect('MAX(message.id)', 'last_message_id')
      .addSelect(
        'SUM(CASE WHEN message.folder = :inbox AND message.is_read = false THEN 1 ELSE 0 END)',
        'unread_count',
      )
      .addSelect(
        'GREATEST(MAX(message.sending_date), MAX(message.receive_date))',
        'last_activity',
      )
      .setParameter('inbox', MessageFolder.INBOX)
      .groupBy('message.phone_number')
      .orderBy('last_activity', 'DESC')
      .offset(skip)
      .limit(limit)
      .getRawMany();

    // Get the full message objects for the last messages
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await this.messageRepository.findOne({
          where: { id: conv.last_message_id },
        });

        return {
          phone_number: conv.phone_number,
          last_message: lastMessage,
          unread_count: parseInt(conv.unread_count, 10),
          last_activity: conv.last_activity,
        };
      }),
    );

    const total = await this.messageRepository
      .createQueryBuilder('message')
      .select('COUNT(DISTINCT message.phone_number)', 'count')
      .getRawOne();

    return {
      conversations: conversationsWithMessages,
      pagination: {
        page,
        limit,
        total: parseInt(total.count, 10),
        pages: Math.ceil(parseInt(total.count, 10) / limit),
      },
    };
  }

  async getMessage(id: number) {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }

  async sendSms(dto: SendSmsDto) {
    // Validate that at least one recipient is provided
    if (!dto.to?.length && !dto.contacts?.length && !dto.groups?.length) {
      throw new BadRequestException('At least one recipient (to, contacts, or groups) is required');
    }

    // Send via SMSEagle
    const response = await this.smsEagleService.sendSMS(dto);

    // Save messages to database
    const messages = await Promise.all(
      response.map(async (result) => {
        const message = this.messageRepository.create({
          smseagle_id: result.id,
          folder: MessageFolder.OUTBOX,
          phone_number: result.number,
          text: dto.text,
          encoding: dto.encoding || 'standard',
          modem_no: dto.modem_no,
          status: result.status,
          validity: dto.validity || '1h',
          sending_date: dto.date ? new Date(dto.date) : new Date(),
          insert_date: new Date(),
        });

        const savedMessage = await this.messageRepository.save(message);

        // Track pending message if validity is set
        if (dto.validity && dto.validity !== 'max') {
          await this.trackPendingMessage(savedMessage, dto.validity);
        }

        return savedMessage;
      }),
    );

    return {
      success: true,
      results: response,
      messages,
    };
  }

  async sendBinarySms(dto: SendBinarySmsDto) {
    // Send via SMSEagle
    const response = await this.smsEagleService.sendBinarySMS(dto);

    // Save to database
    const message = this.messageRepository.create({
      smseagle_id: response[0].id,
      folder: MessageFolder.OUTBOX,
      phone_number: dto.to,
      text_binary: dto.data,
      modem_no: dto.modem_no,
      status: response[0].status,
      sending_date: new Date(),
      insert_date: new Date(),
    });

    const savedMessage = await this.messageRepository.save(message);

    return {
      success: true,
      result: response[0],
      message: savedMessage,
    };
  }

  async markAsRead(id: number) {
    const message = await this.getMessage(id);
    message.is_read = true;
    return this.messageRepository.save(message);
  }

  private async trackPendingMessage(message: Message, validity: string) {
    const validityMap = {
      '5m': 5 * 60 * 1000,
      '10m': 10 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
    };

    const expiresAt = new Date(message.sending_date.getTime() + validityMap[validity]);

    const pending = this.pendingRepository.create({
      message_id: message.id,
      smseagle_id: message.smseagle_id,
      validity_expires_at: expiresAt,
    });

    await this.pendingRepository.save(pending);
  }
}
