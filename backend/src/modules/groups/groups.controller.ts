import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddMembersDto } from './dto/add-members.dto';
import { GetGroupsDto } from './dto/get-groups.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, User } from '../../entities/user.entity';

@ApiTags('Groups')
@ApiBearerAuth()
@Controller('groups')
@UseGuards(AuthGuard, RoleGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Get all groups with pagination' })
  @ApiResponse({ status: 200, description: 'Groups retrieved successfully' })
  getGroups(@Query() dto: GetGroupsDto) {
    return this.groupsService.getGroups(dto);
  }

  @Get('refresh')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Refresh groups from SMSEagle' })
  @ApiResponse({ status: 200, description: 'Groups refreshed successfully' })
  refreshFromSMSEagle() {
    return this.groupsService.refreshFromSMSEagle();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Get single group with members' })
  @ApiResponse({ status: 200, description: 'Group retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  getGroup(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.getGroup(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Create new group' })
  @ApiResponse({ status: 201, description: 'Group created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createGroup(@Body() dto: CreateGroupDto, @CurrentUser() user: User) {
    return this.groupsService.createGroup(dto, user);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Update group' })
  @ApiResponse({ status: 200, description: 'Group updated successfully' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  updateGroup(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGroupDto) {
    return this.groupsService.updateGroup(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Delete group' })
  @ApiResponse({ status: 200, description: 'Group deleted successfully' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  deleteGroup(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.deleteGroup(id);
  }

  @Post(':id/members')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Add contacts to group' })
  @ApiResponse({ status: 200, description: 'Contacts added successfully' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  addMembers(@Param('id', ParseIntPipe) id: number, @Body() dto: AddMembersDto) {
    return this.groupsService.addMembers(id, dto);
  }

  @Delete(':id/members/:contactId')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Remove contact from group' })
  @ApiResponse({ status: 200, description: 'Contact removed successfully' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  removeMember(
    @Param('id', ParseIntPipe) groupId: number,
    @Param('contactId', ParseIntPipe) contactId: number,
  ) {
    return this.groupsService.removeMember(groupId, contactId);
  }
}
