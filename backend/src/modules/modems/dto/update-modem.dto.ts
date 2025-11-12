import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateModemDto {
  @ApiPropertyOptional({ description: 'Custom name for the modem' })
  @IsOptional()
  @IsString()
  custom_name?: string;
}
