import {
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { numberToBigint } from 'src/common/serialization/money';
import { toMachineResponse } from '../mappers/machine.mapper';
import {
  MACHINE_REPOSITORY,
  MachineRepository,
} from '../repositories/machine.repository';

type CreateMachineInput = {
  name: string;
  hourlyCostInCents: number;
  fuelIncludedInHourlyCost?: boolean;
  active?: boolean;
  farmId: string;
};

@Injectable()
export class CreateMachineService {
  constructor(
    @Inject(MACHINE_REPOSITORY)
    private readonly machineRepository: MachineRepository,
  ) {}

  async execute(input: CreateMachineInput) {
    const existing = await this.machineRepository.findByName(
      input.farmId,
      input.name,
    );
    if (existing) {
      throw new ConflictException('Machine name already exists');
    }

    const machine = await this.machineRepository.create({
      name: input.name,
      hourlyCostInCents: numberToBigint(input.hourlyCostInCents),
      fuelIncludedInHourlyCost: input.fuelIncludedInHourlyCost ?? true,
      active: input.active ?? true,
      farmId: input.farmId,
    });

    return { machine: toMachineResponse(machine) };
  }
}
