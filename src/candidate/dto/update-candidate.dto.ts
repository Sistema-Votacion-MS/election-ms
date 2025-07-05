import { PartialType } from '@nestjs/mapped-types';
import { CreateCandidateDto } from './create-candidate.dto';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateCandidateDto extends PartialType(CreateCandidateDto) {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
