import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { numberToBigint } from 'src/common/serialization/money';
import { toMachineResponse } from '../mappers/machine.mapper';
import {
  MACHINE_REPOSITORY,
  MachineRepository,
} from '../repositories/machine.repository';

type UpdateMachineInput = {
  id: string;
  name?: string;
  hourlyCostInCents?: number;
  fuelIncludedInHourlyCost?: boolean;
  active?: boolean;
  farmId: string;
};

@Injectable()
export class UpdateMachineService {
  constructor(
    @Inject(MACHINE_REPOSITORY)
    private readonly machineRepository: MachineRepository,
  ) {}

  async execute(input: UpdateMachineInput) {
    const existing = await this.machineRepository.findById(
      input.id,
      input.farmId,
    );
    if (!existing) {
      throw new NotFoundException('Machine does not exist');
    }

    if (input.name && input.name !== existing.name) {
      const duplicate = await this.machineRepository.findByName(
        input.farmId,
        input.name,
      );
      if (duplicate) {
        throw new ConflictException('Machine name already exists');
      }
    }

    const machine = await this.machineRepository.update({
      id: input.id,
      name: input.name,
      hourlyCostInCents:
        input.hourlyCostInCents != null
          ? numberToBigint(input.hourlyCostInCents)
          : undefined,
      fuelIncludedInHourlyCost: input.fuelIncludedInHourlyCost,
      active: input.active,
    });

    return { machine: toMachineResponse(machine) };
  }
}
