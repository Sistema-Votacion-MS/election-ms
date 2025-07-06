import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { CandidatePaginationDto } from './dto/candidate-pagination.dto';


@Controller()
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) { }

  @MessagePattern({ cmd: 'candidate_create' })
  create(@Payload() createCandidateDto: CreateCandidateDto) {
    return this.candidateService.create(createCandidateDto);
  }

  @MessagePattern({ cmd: 'candidate_find_all' })
  findAll(@Payload() candidatePaginationDto: CandidatePaginationDto) {
    return this.candidateService.findAll(candidatePaginationDto);
  }

  @MessagePattern({ cmd: 'candidate_find_one' })
  findOne(@Payload() payload: string | { id: string }) {
    // Manejar tanto string directo como objeto con id
    const id = typeof payload === 'string' ? payload : payload.id;
    return this.candidateService.findOne(id);
  }

  @MessagePattern({ cmd: 'candidate_update' })
  update(@Payload() updateCandidateDto: UpdateCandidateDto) {
    return this.candidateService.update(updateCandidateDto.id, updateCandidateDto);
  }

  @MessagePattern({ cmd: 'candidate_delete' })
  remove(@Payload() payload: string | { id: string }) {
    // Manejar tanto string directo como objeto con id
    const id = typeof payload === 'string' ? payload : payload.id;
    return this.candidateService.remove(id);
  }
}
