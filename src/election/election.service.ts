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
      this.logger.error('Error creating election:', error);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Failed to create election. Please check if election name is unique and all required fields are provided.',
        error: 'Election Creation Failed'
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
        message: `Election with id ${id} not found or is inactive`,
        error: 'Election Not Found'
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
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(`Error updating election with id ${id}:`, error);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to update election. Please verify the data and try again.',
        error: 'Election Update Failed'
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
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(`Error removing election with id ${id}:`, error);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to deactivate election. Please try again.',
        error: 'Election Removal Failed'
      });
    }
  }
}
