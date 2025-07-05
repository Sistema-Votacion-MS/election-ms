import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ElectionService } from './election.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';

@Controller()
export class ElectionController {
  constructor(private readonly electionService: ElectionService) {}

  @MessagePattern('createElection')
  create(@Payload() createElectionDto: CreateElectionDto) {
    return this.electionService.create(createElectionDto);
  }

  @MessagePattern('findAllElection')
  findAll() {
    return this.electionService.findAll();
  }

  @MessagePattern('findOneElection')
  findOne(@Payload() id: number) {
    return this.electionService.findOne(id);
  }

  @MessagePattern('updateElection')
  update(@Payload() updateElectionDto: UpdateElectionDto) {
    return this.electionService.update(updateElectionDto.id, updateElectionDto);
  }

  @MessagePattern('removeElection')
  remove(@Payload() id: number) {
    return this.electionService.remove(id);
  }
}
