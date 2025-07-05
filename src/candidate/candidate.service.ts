import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { PrismaClient } from 'generated/prisma';
import { RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class CandidateService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('CandidateService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  create(createCandidateDto: CreateCandidateDto) {
    try {
      return this.candidate.create({
        data: createCandidateDto
      });
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check logs',
      });
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { page, limit } = paginationDto;

      const total = await this.candidate.count({ where: { is_active: true } });
      const lastPage = Math.ceil(total / limit);

      return {
        data: this.candidate.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where: {
            is_active: true,
          },
        }),
        meta: {
          total: total,
          page: page,
          lastPage: lastPage,
        },
      };
    } catch (error) {
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

      return this.candidate.update({
        where: { id: id },
        data: data,
      });
    } catch (error) {
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
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check logs',
      });
    }
  }
}
