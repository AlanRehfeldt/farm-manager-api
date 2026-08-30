import { Inject, Injectable } from '@nestjs/common';
import { toMachineResponse } from '../mappers/machine.mapper';
import { SearchManyQuery } from '../repositories/@types';
import {
  MACHINE_REPOSITORY,
  MachineRepository,
} from '../repositories/machine.repository';

@Injectable()
export class FetchMachinesService {
  constructor(
    @Inject(MACHINE_REPOSITORY)
    private readonly machineRepository: MachineRepository,
  ) {}

  async execute(query: SearchManyQuery) {
    const [machines, total] = await Promise.all([
      this.machineRepository.searchMany(query),
      this.machineRepository.count(query),
    ]);

    return {
      results: machines.map(toMachineResponse),
      total,
      page: query.page,
      perPage: query.perPage,
      orderBy: query.orderBy,
      orderDirection: query.orderDirection,
    };
  }
}
