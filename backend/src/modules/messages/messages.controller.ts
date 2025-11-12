import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { SendSmsDto } from './dto/send-sms.dto';
import { SendBinarySmsDto } from './dto/send-binary-sms.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
@UseGuards(AuthGuard, RoleGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Get paginated messages from folder or conversation' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  getMessages(@Query() dto: GetMessagesDto) {
    return this.messagesService.getMessages(dto);
  }

  @Get('conversations')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Get list of conversations with latest message' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  getConversations(@Query('page', ParseIntPipe) page: number = 1, @Query('limit', ParseIntPipe) limit: number = 20) {
    return this.messagesService.getConversations(page, limit);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Get single message by ID' })
  @ApiResponse({ status: 200, description: 'Message retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  getMessage(@Param('id', ParseIntPipe) id: number) {
    return this.messagesService.getMessage(id);
  }

  @Post('sms')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Send SMS message' })
  @ApiResponse({ status: 201, description: 'SMS sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  sendSms(@Body() dto: SendSmsDto) {
    return this.messagesService.sendSms(dto);
  }

  @Post('binary')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Send binary SMS message' })
  @ApiResponse({ status: 201, description: 'Binary SMS sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  sendBinarySms(@Body() dto: SendBinarySmsDto) {
    return this.messagesService.sendBinarySms(dto);
  }

  @Patch(':id/read')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.messagesService.markAsRead(id);
  }
}
