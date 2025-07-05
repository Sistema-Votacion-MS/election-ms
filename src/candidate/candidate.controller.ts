import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Controller()
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @MessagePattern('createCandidate')
  create(@Payload() createCandidateDto: CreateCandidateDto) {
    return this.candidateService.create(createCandidateDto);
  }

  @MessagePattern('findAllCandidate')
  findAll() {
    return this.candidateService.findAll();
  }

  @MessagePattern('findOneCandidate')
  findOne(@Payload() id: number) {
    return this.candidateService.findOne(id);
  }

  @MessagePattern('updateCandidate')
  update(@Payload() updateCandidateDto: UpdateCandidateDto) {
    return this.candidateService.update(updateCandidateDto.id, updateCandidateDto);
  }

  @MessagePattern('removeCandidate')
  remove(@Payload() id: number) {
    return this.candidateService.remove(id);
  }
}
