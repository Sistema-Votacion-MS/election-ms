import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ElectionStatus } from "../enum/election.enum";

export class CreateElectionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @Type(() => Date)
  start_date: Date;

  @IsNotEmpty()
  @Type(() => Date)
  end_date: Date;

  @IsNotEmpty()
  @IsEnum(ElectionStatus)
  status: ElectionStatus;
}
