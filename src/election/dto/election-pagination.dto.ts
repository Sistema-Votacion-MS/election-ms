import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ElectionStatus } from '../enum/election.enum';

export class ElectionPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ElectionStatus, {
    message: `Valid status are ${ElectionStatus.PENDING}, ${ElectionStatus.OPEN}, ${ElectionStatus.CALCULATING}, ${ElectionStatus.COMPLETED}`,
  })
  status: ElectionStatus;
}