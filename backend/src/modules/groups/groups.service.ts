import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ContactGroup } from '../../entities/contact-group.entity';
import { Contact } from '../../entities/contact.entity';
import { User } from '../../entities/user.entity';
import { SMSEagleService } from '../smseagle/smseagle.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddMembersDto } from './dto/add-members.dto';
import { GetGroupsDto } from './dto/get-groups.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(ContactGroup)
    private groupRepository: Repository<ContactGroup>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    private smsEagleService: SMSEagleService,
  ) {}

  async getGroups(dto: GetGroupsDto) {
    const { search, page, limit } = dto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.contacts', 'contacts')
      .skip(skip)
      .take(limit)
      .orderBy('group.name', 'ASC');

    if (search) {
      queryBuilder.andWhere('group.name LIKE :search', { search: `%${search}%` });
    }

    const [groups, total] = await queryBuilder.getManyAndCount();

    return {
      groups,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getGroup(id: number) {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['contacts'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  async createGroup(dto: CreateGroupDto, user: User) {
    // Create in local DB first
    const group = this.groupRepository.create({
      name: dto.name,
      created_by: user.id,
    });

    const savedGroup = await this.groupRepository.save(group);

    // Sync to SMSEagle
    try {
      const smsEagleGroup = await this.smsEagleService.createGroup({
        name: dto.name,
      });

      // Update with SMSEagle ID
      savedGroup.smseagle_id = smsEagleGroup.id;
      await this.groupRepository.save(savedGroup);
    } catch (error) {
      console.error('Failed to sync group to SMSEagle:', error.message);
    }

    return savedGroup;
  }

  async updateGroup(id: number, dto: UpdateGroupDto) {
    const group = await this.getGroup(id);

    Object.assign(group, dto);
    const updatedGroup = await this.groupRepository.save(group);

    // Sync to SMSEagle if it has an SMSEagle ID
    if (group.smseagle_id) {
      try {
        await this.smsEagleService.updateGroup(group.smseagle_id, {
          name: updatedGroup.name,
        });
      } catch (error) {
        console.error('Failed to sync group update to SMSEagle:', error.message);
      }
    }

    return updatedGroup;
  }

  async deleteGroup(id: number) {
    const group = await this.getGroup(id);

    // Delete from SMSEagle if synced
    if (group.smseagle_id) {
      try {
        await this.smsEagleService.deleteGroup(group.smseagle_id);
      } catch (error) {
        console.error('Failed to delete group from SMSEagle:', error.message);
      }
    }

    await this.groupRepository.remove(group);

    return { message: 'Group deleted successfully' };
  }

  async addMembers(id: number, dto: AddMembersDto) {
    const group = await this.getGroup(id);

    // Find contacts
    const contacts = await this.contactRepository.findBy({
      id: In(dto.contact_ids),
    });

    if (contacts.length !== dto.contact_ids.length) {
      throw new BadRequestException('One or more contacts not found');
    }

    // Add contacts to group
    group.contacts = [...(group.contacts || []), ...contacts];
    const updatedGroup = await this.groupRepository.save(group);

    // Sync to SMSEagle
    if (group.smseagle_id) {
      for (const contact of contacts) {
        if (contact.smseagle_id) {
          try {
            await this.smsEagleService.addContactToGroup(group.smseagle_id, contact.smseagle_id);
          } catch (error) {
            console.error('Failed to add contact to group in SMSEagle:', error.message);
          }
        }
      }
    }

    return updatedGroup;
  }

  async removeMember(groupId: number, contactId: number) {
    const group = await this.getGroup(groupId);

    // Find and remove contact
    group.contacts = group.contacts.filter((c) => c.id !== contactId);
    const updatedGroup = await this.groupRepository.save(group);

    // Sync to SMSEagle
    if (group.smseagle_id) {
      const contact = await this.contactRepository.findOne({ where: { id: contactId } });
      if (contact?.smseagle_id) {
        try {
          await this.smsEagleService.removeContactFromGroup(
            group.smseagle_id,
            contact.smseagle_id,
          );
        } catch (error) {
          console.error('Failed to remove contact from group in SMSEagle:', error.message);
        }
      }
    }

    return { message: 'Contact removed from group successfully' };
  }

  async refreshFromSMSEagle() {
    // Fetch all groups from SMSEagle
    const smsEagleGroups = await this.smsEagleService.getGroups();

    let synced = 0;
    let created = 0;

    for (const smsGroup of smsEagleGroups) {
      // Check if exists locally
      let group = await this.groupRepository.findOne({
        where: { smseagle_id: smsGroup.id },
      });

      if (group) {
        // Update existing
        group.name = smsGroup.name;
        await this.groupRepository.save(group);
        synced++;
      } else {
        // Create new
        group = this.groupRepository.create({
          smseagle_id: smsGroup.id,
          name: smsGroup.name,
        });
        await this.groupRepository.save(group);
        created++;
      }
    }

    return {
      message: 'Groups refreshed from SMSEagle',
      synced,
      created,
      total: smsEagleGroups.length,
    };
  }
}
