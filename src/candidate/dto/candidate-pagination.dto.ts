import { IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class CandidatePaginationDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  election_id?: string;
}
