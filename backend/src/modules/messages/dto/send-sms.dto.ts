import { IsString, IsOptional, IsArray, IsEnum, IsInt, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendSmsDto {
  @ApiPropertyOptional({ type: [String], description: 'Phone numbers to send SMS to' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  to?: string[];

  @ApiPropertyOptional({ type: [Number], description: 'Contact IDs to send SMS to' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  contacts?: number[];

  @ApiPropertyOptional({ type: [Number], description: 'Group IDs to send SMS to' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  groups?: number[];

  @ApiProperty({ description: 'SMS text content', maxLength: 2000 })
  @IsString()
  @MaxLength(2000, { message: 'SMS text cannot exceed 2000 characters' })
  text: string;

  @ApiPropertyOptional({ description: 'Scheduled date/time to send (ISO 8601)' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ enum: ['standard', 'unicode'], default: 'standard' })
  @IsOptional()
  @IsEnum(['standard', 'unicode'])
  encoding?: 'standard' | 'unicode';

  @ApiPropertyOptional({ enum: ['5m', '10m', '30m', '1h'], default: '1h' })
  @IsOptional()
  @IsEnum(['5m', '10m', '30m', '1h'])
  validity?: '5m' | '10m' | '30m' | '1h';

  @ApiPropertyOptional({ description: 'Modem number (1-8)', minimum: 1, maximum: 8 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  modem_no?: number;
}
