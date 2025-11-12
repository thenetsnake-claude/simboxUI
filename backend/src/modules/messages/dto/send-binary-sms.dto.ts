import { IsString, IsInt, Min, Max, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendBinarySmsDto {
  @ApiProperty({ description: 'Phone number to send binary SMS to' })
  @IsString()
  to: string;

  @ApiProperty({ description: 'Binary data in hexadecimal format' })
  @IsString()
  @Matches(/^[0-9A-Fa-f]+$/, { message: 'Data must be valid hexadecimal' })
  data: string;

  @ApiPropertyOptional({ description: 'Modem number (1-8)', minimum: 1, maximum: 8 })
  @IsInt()
  @Min(1)
  @Max(8)
  modem_no?: number;
}
