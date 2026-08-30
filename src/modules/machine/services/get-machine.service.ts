import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { toMachineResponse } from '../mappers/machine.mapper';
import {
  MACHINE_REPOSITORY,
  MachineRepository,
} from '../repositories/machine.repository';

@Injectable()
export class GetMachineService {
  constructor(
    @Inject(MACHINE_REPOSITORY)
    private readonly machineRepository: MachineRepository,
  ) {}

  async execute(id: string, farmId: string) {
    const machine = await this.machineRepository.findById(id, farmId);
    if (!machine) {
      throw new NotFoundException('Machine does not exist');
    }

    return { machine: toMachineResponse(machine) };
  }
}
