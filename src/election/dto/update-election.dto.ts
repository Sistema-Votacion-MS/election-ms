import { PartialType } from '@nestjs/mapped-types';
import { CreateElectionDto } from './create-election.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateElectionDto extends PartialType(CreateElectionDto) {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
