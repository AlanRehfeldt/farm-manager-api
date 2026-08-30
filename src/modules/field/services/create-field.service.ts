import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { parseDecimal } from 'src/common/serialization/decimal';
import {
  FIELD_REPOSITORY,
  FieldRepository,
} from '../repositories/field.repository';
import { toFieldResponse } from '../mappers/field.mapper';

type CreateFieldInput = {
  name: string;
  areaHa: string | number;
  active?: boolean;
  plantsPerHa?: string | number | null;
  plantedYear?: number | null;
  spacingNote?: string | null;
  externalRef?: string | null;
  farmId: string;
};

@Injectable()
export class CreateFieldService {
  constructor(
    @Inject(FIELD_REPOSITORY)
    private readonly fieldRepository: FieldRepository,
  ) {}

  async execute(input: CreateFieldInput) {
    const areaHa = parseDecimal(input.areaHa);
    if (areaHa.lte(0)) {
      throw new BadRequestException('areaHa must be greater than 0');
    }

    const existing = await this.fieldRepository.findByName(
      input.farmId,
      input.name,
    );
    if (existing) {
      throw new ConflictException('Field name already exists');
    }

    let plantsPerHa: Prisma.Decimal | null | undefined;
    if (input.plantsPerHa != null) {
      plantsPerHa = parseDecimal(input.plantsPerHa);
    }

    const field = await this.fieldRepository.create({
      name: input.name,
      areaHa,
      active: input.active ?? true,
      plantsPerHa,
      plantedYear: input.plantedYear,
      spacingNote: input.spacingNote,
      externalRef: input.externalRef,
      farmId: input.farmId,
    });

    return { field: toFieldResponse(field) };
  }
}
