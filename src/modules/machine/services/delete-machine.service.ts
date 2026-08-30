import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MACHINE_REPOSITORY,
  MachineRepository,
} from '../repositories/machine.repository';

@Injectable()
export class DeleteMachineService {
  constructor(
    @Inject(MACHINE_REPOSITORY)
    private readonly machineRepository: MachineRepository,
  ) {}

  async execute(id: string, farmId: string) {
    const existing = await this.machineRepository.findById(id, farmId);
    if (!existing) {
      throw new NotFoundException('Machine does not exist');
    }

    await this.machineRepository.delete(id);
  }
}
