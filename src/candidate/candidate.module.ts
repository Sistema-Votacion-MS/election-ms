import { Module } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import { CandidateController } from './candidate.controller';
import { ElectionService } from '../election/election.service';

@Module({
  controllers: [CandidateController],
  providers: [CandidateService, ElectionService],
})
export class CandidateModule { }
