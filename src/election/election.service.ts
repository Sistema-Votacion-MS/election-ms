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
    this.logger.log(`[create] Starting election creation with name: ${createElectionDto.name}`);
    
    try {
      this.logger.debug(`[create] Creating election with data:`, {
        name: createElectionDto.name,
        description: createElectionDto.description,
        status: createElectionDto.status
      });
      
      const newElection = this.election.create({
        data: createElectionDto
      });
      
      this.logger.log(`[create] Election creation initiated successfully`);
      return newElection;
    } catch (error) {
      this.logger.error(`[create] Error creating election:`, error);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Failed to create election. Please check if election name is unique and all required fields are provided.',
        error: 'Election Creation Failed'
      });
    }
  }

  async findAll(electionPaginationDto: ElectionPaginationDto) {
    this.logger.log(`[findAll] Starting to fetch elections - Status: ${electionPaginationDto.status}, Page: ${electionPaginationDto.page}, Limit: ${electionPaginationDto.limit}`);
    const startTime = Date.now();
    
    const { status, page, limit } = electionPaginationDto;

    this.logger.debug(`[findAll] Counting total active elections with status: ${status}`);
    const total = await this.election.count({ where: { status: status, is_active: true } });
    const lastPage = Math.ceil(total / limit);
    
    this.logger.debug(`[findAll] Found ${total} total elections, fetching page ${page}/${lastPage}`);

    const elections = await this.election.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        status: status,
        is_active: true,
      },
    });

    const duration = Date.now() - startTime;
    this.logger.log(`[findAll] Successfully fetched ${elections.length} elections in ${duration}ms`);

    return {
      data: elections,
      meta: {
        total: total,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: string) {
    this.logger.log(`[findOne] Searching for election with ID: ${id}`);
    
    this.logger.debug(`[findOne] Querying database for active election with ID: ${id}`);
    const election = await this.election.findUnique({
      where: { id: id, is_active: true },
    });

    if (!election) {
      this.logger.warn(`[findOne] Election not found or inactive with ID: ${id}`);
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Election with id ${id} not found or is inactive`,
        error: 'Election Not Found'
      });
    }

    this.logger.log(`[findOne] Election found successfully: ${election.name} (${election.id})`);
    return election;
  }
  async update(id: string, updateElectionDto: UpdateElectionDto) {
    this.logger.log(`[update] Starting election update for ID: ${id}`);
    
    try {
      const { id: __, ...data } = updateElectionDto;

      this.logger.debug(`[update] Verifying election exists before update`);
      await this.findOne(id);

      this.logger.debug(`[update] Updating election with data:`, data);
      const result = await this.election.update({
        where: { id: id },
        data: data,
      });
      
      this.logger.log(`[update] Election updated successfully: ${id}`);
      return result;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      
      this.logger.error(`[update] Error updating election with id ${id}:`, error);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to update election. Please verify the data and try again.',
        error: 'Election Update Failed'
      });
    }
  }
  async remove(id: string) {
    this.logger.log(`[remove] Starting election deactivation for ID: ${id}`);
    
    try {
      this.logger.debug(`[remove] Verifying election exists before deactivation`);
      await this.findOne(id);

      this.logger.debug(`[remove] Deactivating election with ID: ${id}`);
      const result = await this.election.update({
        where: { id: id },
        data: { is_active: false },
      });
      
      this.logger.log(`[remove] Election deactivated successfully: ${id}`);
      return result;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      
      this.logger.error(`[remove] Error removing election with id ${id}:`, error);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to deactivate election. Please try again.',
        error: 'Election Removal Failed'
      });
    }
  }
}
