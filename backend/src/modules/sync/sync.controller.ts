import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('Sync')
@ApiBearerAuth()
@Controller('sync')
@UseGuards(AuthGuard, RoleGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get sync status and statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Sync status retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  getSyncStatus() {
    return this.syncService.getSyncStatus();
  }

  @Post('manual')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Trigger manual sync (Admin only)' })
  @ApiResponse({ status: 200, description: 'Manual sync completed' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  manualSync() {
    return this.syncService.manualSync();
  }
}
