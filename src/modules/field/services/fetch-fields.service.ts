import { Inject, Injectable } from '@nestjs/common';
import {
  FIELD_REPOSITORY,
  FieldRepository,
} from '../repositories/field.repository';
import { SearchManyQuery } from '../repositories/@types';
import { toFieldResponse } from '../mappers/field.mapper';

@Injectable()
export class FetchFieldsService {
  constructor(
    @Inject(FIELD_REPOSITORY)
    private readonly fieldRepository: FieldRepository,
  ) {}

  async execute(query: SearchManyQuery) {
    const [fields, total] = await Promise.all([
      this.fieldRepository.searchMany(query),
      this.fieldRepository.count(query),
    ]);

    return {
      results: fields.map(toFieldResponse),
      total,
      page: query.page,
      perPage: query.perPage,
      orderBy: query.orderBy,
      orderDirection: query.orderDirection,
    };
  }
}
