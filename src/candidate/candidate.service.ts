import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { PrismaClient } from 'generated/prisma';
import { RpcException } from '@nestjs/microservices';
import { ElectionService } from '../election/election.service';
import { CandidatePaginationDto } from './dto/candidate-pagination.dto';

@Injectable()
export class CandidateService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('CandidateService');

  constructor(private readonly electionService: ElectionService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async create(createCandidateDto: CreateCandidateDto) {
    this.logger.log(`[create] Starting candidate creation for election: ${createCandidateDto.election_id}`);
    
    try {
      this.logger.debug(`[create] Verifying election exists before creating candidate`);
      await this.electionService.findOne(createCandidateDto.election_id);

      this.logger.debug(`[create] Creating candidate with data:`, {
        name: createCandidateDto.name,
        election_id: createCandidateDto.election_id
      });

      const newCandidate = await this.candidate.create({
        data: createCandidateDto
      });
      
      this.logger.log(`[create] Candidate created successfully with ID: ${newCandidate.id}`);
      return newCandidate;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(`[create] Error creating candidate for election ${createCandidateDto.election_id}:`, error);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Error creating candidate. Check logs for details.',
        error: 'Candidate Creation Failed'
      });
    }
  }

  async findAll(paginationDto: CandidatePaginationDto) {
    this.logger.log(`[findAll] Starting to fetch candidates for election: ${paginationDto.election_id} - Page: ${paginationDto.page}, Limit: ${paginationDto.limit}`);
    const startTime = Date.now();
    
    try {
      const { election_id, page, limit } = paginationDto;

      this.logger.debug(`[findAll] Counting total active candidates for election: ${election_id}`);
      const total = await this.candidate.count({ where: { is_active: true, election_id: election_id } });
      const lastPage = Math.ceil(total / limit);
      
      this.logger.debug(`[findAll] Found ${total} total candidates, fetching page ${page}/${lastPage}`);

      const candidates = await this.candidate.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          is_active: true,
          election_id: election_id,
        },
      });

      const duration = Date.now() - startTime;
      this.logger.log(`[findAll] Successfully fetched ${candidates.length} candidates in ${duration}ms`);

      return {
        data: candidates,
        meta: {
          total: total,
          page: page,
          lastPage: lastPage,
        },
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(`[findAll] Error fetching candidates for election ${paginationDto.election_id}:`, error);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve candidates. Please try again later.',
        error: 'Database Error'
      });
    }
  }

  async findOne(id: string) {
    this.logger.log(`[findOne] Searching for candidate with ID: ${id}`);
    
    this.logger.debug(`[findOne] Querying database for active candidate with ID: ${id}`);
    const candidate = await this.candidate.findUnique({
      where: { id: id, is_active: true },
    });

    if (!candidate) {
      this.logger.warn(`[findOne] Candidate not found or inactive with ID: ${id}`);
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Candidate with id ${id} not found or is inactive`,
        error: 'Candidate Not Found'
      });
    }

    this.logger.log(`[findOne] Candidate found successfully: ${candidate.name} (${candidate.id})`);
    return candidate;
  }

  async update(id: string, updateCandidateDto: UpdateCandidateDto) {
    this.logger.log(`[update] Starting candidate update for ID: ${id}`);
    
    try {
      const { id: __, ...data } = updateCandidateDto;

      this.logger.debug(`[update] Verifying candidate exists before update`);
      await this.findOne(id);

      if (updateCandidateDto?.election_id) {
        this.logger.debug(`[update] Verifying new election exists`);
        await this.electionService.findOne(updateCandidateDto.election_id);
      }

      this.logger.debug(`[update] Updating candidate with data:`, data);
      const result = await this.candidate.update({
        where: { id: id },
        data: data,
      });
      
      this.logger.log(`[update] Candidate updated successfully: ${id}`);
      return result;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(`[update] Error updating candidate with id ${id}:`, error);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to update candidate. Please verify the data and try again.',
        error: 'Candidate Update Failed'
      });
    }
  }

  async remove(id: string) {
    this.logger.log(`[remove] Starting candidate deactivation for ID: ${id}`);
    
    try {
      this.logger.debug(`[remove] Verifying candidate exists before deactivation`);
      await this.findOne(id);

      this.logger.debug(`[remove] Deactivating candidate with ID: ${id}`);
      const result = await this.candidate.update({
        where: { id: id },
        data: { is_active: false },
      });
      
      this.logger.log(`[remove] Candidate deactivated successfully: ${id}`);
      return result;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(`[remove] Error deleting candidate with id ${id}:`, error);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to deactivate candidate. Please try again.',
        error: 'Candidate Removal Failed'
      });
    }
  }
}
