import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ElectionService } from './election.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';
import { ElectionPaginationDto } from './dto/election-pagination.dto';

@Controller()
export class ElectionController {
  constructor(private readonly electionService: ElectionService) { }

  @MessagePattern({ cmd: 'election_create' })
  create(@Payload() createElectionDto: CreateElectionDto) {
    return this.electionService.create(createElectionDto);
  }

  @MessagePattern({ cmd: 'election_find_all' })
  findAll(@Payload() electionPaginationDto: ElectionPaginationDto) {
    return this.electionService.findAll(electionPaginationDto);
  }

  @MessagePattern({ cmd: 'election_find_one' })
  findOne(@Payload() payload: string | { id: string }) {
    // Manejar tanto string directo como objeto con id
    const id = typeof payload === 'string' ? payload : payload.id;
    return this.electionService.findOne(id);
  }

  @MessagePattern({ cmd: 'election_update' })
  update(@Payload() updateElectionDto: UpdateElectionDto) {
    return this.electionService.update(updateElectionDto.id, updateElectionDto);
  }

  @MessagePattern({ cmd: 'election_delete' })
  remove(@Payload() payload: string | { id: string }) {
    // Manejar tanto string directo como objeto con id
    const id = typeof payload === 'string' ? payload : payload.id;
    return this.electionService.remove(id);
  }
}
