import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FIELD_REPOSITORY,
  FieldRepository,
} from '../repositories/field.repository';
import { toFieldResponse } from '../mappers/field.mapper';

@Injectable()
export class GetFieldService {
  constructor(
    @Inject(FIELD_REPOSITORY)
    private readonly fieldRepository: FieldRepository,
  ) {}

  async execute(id: string, farmId: string) {
    const field = await this.fieldRepository.findById(id, farmId);
    if (!field) {
      throw new NotFoundException('Field does not exist');
    }

    return { field: toFieldResponse(field) };
  }
}
