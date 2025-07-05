import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';
import { PrismaClient } from 'generated/prisma';
import { ElectionPaginationDto } from './dto/election-pagination.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ElectionService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ElectionService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  create(createElectionDto: CreateElectionDto) {
    try {
      return this.election.create({
        data: createElectionDto
      });
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check logs',
      });
    }
  }

  async findAll(electionPaginationDto: ElectionPaginationDto) {
    const { status, page, limit } = electionPaginationDto;

    const total = await this.election.count({ where: { status: status, is_active: true } });
    const lastPage = Math.ceil(total / limit);

    return {
      data: await this.election.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          status: status,
          is_active: true,
        },
      }),
      meta: {
        total: total,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: string) {
    const election = await this.election.findUnique({
      where: { id: id, is_active: true },
    });

    if (!election) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Election with id ${id} not found`,
      });
    }

    return election;
  }

  async update(id: string, updateElectionDto: UpdateElectionDto) {
    try {
      const { id: __, ...data } = updateElectionDto;

      await this.findOne(id);

      return this.election.update({
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

      return this.election.update({
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
