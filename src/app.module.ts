import { Module } from '@nestjs/common';
import { ElectionModule } from './election/election.module';
import { CandidateModule } from './candidate/candidate.module';

@Module({
  imports: [ElectionModule, CandidateModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
