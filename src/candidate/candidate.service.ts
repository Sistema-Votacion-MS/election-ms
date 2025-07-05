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
    try {
      await this.electionService.findOne(createCandidateDto.election_id);

      return this.candidate.create({
        data: createCandidateDto
      });
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error('Error creating candidate:', error);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Error creating candidate. Check logs for details.',
      });
    }
  }

  async findAll(paginationDto: CandidatePaginationDto) {
    try {
      const { election_id, page, limit } = paginationDto;

      const total = await this.candidate.count({ where: { is_active: true, election_id: election_id} });
      const lastPage = Math.ceil(total / limit);

      return {
        data: await this.candidate.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: {
            is_active: true,
            election_id: election_id,
          },
        }),
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

      this.logger.error('Error fetching candidates:', error);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check logs',
      });
    }
  }

  async findOne(id: string) {
    const candidate = await this.candidate.findUnique({
      where: { id: id, is_active: true },
    });

    if (!candidate) {
      this.logger.warn(`Candidate with id ${id} not found`);
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Candidate whith id ${id} not found`,
      });
    }

    return candidate;
  }

  async update(id: string, updateCandidateDto: UpdateCandidateDto) {
    try {
      const { id: __, ...data } = updateCandidateDto;

      await this.findOne(id);

      if (updateCandidateDto?.election_id) {
        await this.electionService.findOne(updateCandidateDto.election_id);
      }

      return this.candidate.update({
        where: { id: id },
        data: data,
      });
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error('Error updating candidate:', error);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check logs',
      });
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);

      return this.candidate.update({
        where: { id: id },
        data: { is_active: false },
      });
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error('Error deleting candidate:', error);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check logs',
      });
    }
  }
}
