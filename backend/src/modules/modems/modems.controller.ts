import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ModemsService } from './modems.service';
import { UpdateModemDto } from './dto/update-modem.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('Modems')
@ApiBearerAuth()
@Controller('modems')
@UseGuards(AuthGuard, RoleGuard)
export class ModemsController {
  constructor(private readonly modemsService: ModemsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Get all modems with custom names and status' })
  @ApiResponse({ status: 200, description: 'Modems retrieved successfully' })
  getModems() {
    return this.modemsService.getModems();
  }

  @Get(':modem_no')
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Get single modem info' })
  @ApiResponse({ status: 200, description: 'Modem retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Invalid modem number' })
  getModem(@Param('modem_no', ParseIntPipe) modem_no: number) {
    return this.modemsService.getModem(modem_no);
  }

  @Put(':modem_no')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update modem custom name (Admin only)' })
  @ApiResponse({ status: 200, description: 'Modem updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Invalid modem number' })
  updateModem(@Param('modem_no', ParseIntPipe) modem_no: number, @Body() dto: UpdateModemDto) {
    return this.modemsService.updateModem(modem_no, dto);
  }
}
