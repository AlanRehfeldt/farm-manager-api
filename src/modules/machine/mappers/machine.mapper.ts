import { Machine } from '@prisma/client';
import { bigintToNumber } from 'src/common/serialization/money';

export type MachineResponse = {
  id: string;
  farmId: string;
  name: string;
  hourlyCostInCents: number;
  fuelIncludedInHourlyCost: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function toMachineResponse(machine: Machine): MachineResponse {
  return {
    id: machine.id,
    farmId: machine.farmId,
    name: machine.name,
    hourlyCostInCents: bigintToNumber(machine.hourlyCostInCents)!,
    fuelIncludedInHourlyCost: machine.fuelIncludedInHourlyCost,
    active: machine.active,
    createdAt: machine.createdAt,
    updatedAt: machine.updatedAt,
  };
}
