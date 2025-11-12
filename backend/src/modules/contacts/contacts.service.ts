import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Contact } from '../../entities/contact.entity';
import { User } from '../../entities/user.entity';
import { SMSEagleService } from '../smseagle/smseagle.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { GetContactsDto } from './dto/get-contacts.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    private smsEagleService: SMSEagleService,
  ) {}

  async getContacts(dto: GetContactsDto) {
    const { search, page, limit } = dto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.contactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.groups', 'groups')
      .skip(skip)
      .take(limit)
      .orderBy('contact.name', 'ASC');

    if (search) {
      queryBuilder.andWhere(
        '(contact.name LIKE :search OR contact.phone_number LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [contacts, total] = await queryBuilder.getManyAndCount();

    return {
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getContact(id: number) {
    const contact = await this.contactRepository.findOne({
      where: { id },
      relations: ['groups'],
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async createContact(dto: CreateContactDto, user: User) {
    // Create in local DB first
    const contact = this.contactRepository.create({
      name: dto.name,
      phone_number: dto.phone_number,
      created_by: user.id,
    });

    const savedContact = await this.contactRepository.save(contact);

    // Sync to SMSEagle
    try {
      const smsEagleContact = await this.smsEagleService.createContact({
        name: dto.name,
        number: dto.phone_number,
      });

      // Update with SMSEagle ID
      savedContact.smseagle_id = smsEagleContact.id;
      await this.contactRepository.save(savedContact);
    } catch (error) {
      // Log error but don't fail the request - local DB is source of truth
      console.error('Failed to sync contact to SMSEagle:', error.message);
    }

    return savedContact;
  }

  async updateContact(id: number, dto: UpdateContactDto) {
    const contact = await this.getContact(id);

    Object.assign(contact, dto);
    const updatedContact = await this.contactRepository.save(contact);

    // Sync to SMSEagle if it has an SMSEagle ID
    if (contact.smseagle_id) {
      try {
        await this.smsEagleService.updateContact(contact.smseagle_id, {
          name: updatedContact.name,
          number: updatedContact.phone_number,
        });
      } catch (error) {
        console.error('Failed to sync contact update to SMSEagle:', error.message);
      }
    }

    return updatedContact;
  }

  async deleteContact(id: number) {
    const contact = await this.getContact(id);

    // Delete from SMSEagle if synced
    if (contact.smseagle_id) {
      try {
        await this.smsEagleService.deleteContact(contact.smseagle_id);
      } catch (error) {
        console.error('Failed to delete contact from SMSEagle:', error.message);
      }
    }

    await this.contactRepository.remove(contact);

    return { message: 'Contact deleted successfully' };
  }

  async refreshFromSMSEagle() {
    // Fetch all contacts from SMSEagle
    const smsEagleContacts = await this.smsEagleService.getContacts();

    let synced = 0;
    let created = 0;

    for (const smsContact of smsEagleContacts) {
      // Check if exists locally
      let contact = await this.contactRepository.findOne({
        where: { smseagle_id: smsContact.id },
      });

      if (contact) {
        // Update existing
        contact.name = smsContact.name;
        contact.phone_number = smsContact.number;
        await this.contactRepository.save(contact);
        synced++;
      } else {
        // Create new
        contact = this.contactRepository.create({
          smseagle_id: smsContact.id,
          name: smsContact.name,
          phone_number: smsContact.number,
        });
        await this.contactRepository.save(contact);
        created++;
      }
    }

    return {
      message: 'Contacts refreshed from SMSEagle',
      synced,
      created,
      total: smsEagleContacts.length,
    };
  }
}
