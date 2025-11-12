import { IsArray, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMembersDto {
  @ApiProperty({ type: [Number], description: 'Array of contact IDs to add to group' })
  @IsArray()
  @IsInt({ each: true })
  contact_ids: number[];
}
