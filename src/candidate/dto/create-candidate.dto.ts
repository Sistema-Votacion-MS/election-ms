import { IsNotEmpty, IsString, IsUrl, IsUUID } from "class-validator";

export class CreateCandidateDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  election_id: string;

  @IsString()
  @IsNotEmpty()
  party: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  image_url: string;

}
