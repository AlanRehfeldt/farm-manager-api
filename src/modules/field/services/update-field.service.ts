import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { parseDecimal } from 'src/common/serialization/decimal';
import {
  FIELD_REPOSITORY,
  FieldRepository,
} from '../repositories/field.repository';
import { toFieldResponse } from '../mappers/field.mapper';

type UpdateFieldInput = {
  id: string;
  name?: string;
  areaHa?: string | number;
  active?: boolean;
  plantsPerHa?: string | number | null;
  plantedYear?: number | null;
  spacingNote?: string | null;
  externalRef?: string | null;
  farmId: string;
};

@Injectable()
export class UpdateFieldService {
  constructor(
    @Inject(FIELD_REPOSITORY)
    private readonly fieldRepository: FieldRepository,
  ) {}

  async execute(input: UpdateFieldInput) {
    const existing = await this.fieldRepository.findById(
      input.id,
      input.farmId,
    );
    if (!existing) {
      throw new NotFoundException('Field does not exist');
    }

    if (input.name && input.name !== existing.name) {
      const duplicate = await this.fieldRepository.findByName(
        input.farmId,
        input.name,
      );
      if (duplicate) {
        throw new ConflictException('Field name already exists');
      }
    }

    let areaHa: Prisma.Decimal | undefined;
    if (input.areaHa != null) {
      areaHa = parseDecimal(input.areaHa);
      if (areaHa.lte(0)) {
        throw new BadRequestException('areaHa must be greater than 0');
      }
    }

    let plantsPerHa: Prisma.Decimal | null | undefined;
    if (input.plantsPerHa !== undefined) {
      plantsPerHa =
        input.plantsPerHa == null ? null : parseDecimal(input.plantsPerHa);
    }

    const field = await this.fieldRepository.update({
      id: input.id,
      name: input.name,
      areaHa,
      active: input.active,
      plantsPerHa,
      plantedYear: input.plantedYear,
      spacingNote: input.spacingNote,
      externalRef: input.externalRef,
    });

    return { field: toFieldResponse(field) };
  }
}
