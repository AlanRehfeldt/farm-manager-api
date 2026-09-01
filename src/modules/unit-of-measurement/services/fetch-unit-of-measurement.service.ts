import { Inject, Injectable } from '@nestjs/common';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from '../repositories/unit-of-measurement.repository';
import { SearchManyQuery } from '../repositories/@types';
import { toUnitOfMeasurementResponse } from '../mappers/unit-of-measurement.mapper';

@Injectable()
export class FetchUnitOfMeasurementsService {
  constructor(
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
  ) {}

  async execute(params: SearchManyQuery) {
    const unitOfMeasurements =
      await this.unitOfMeasurementRepository.searchMany(params);
    const total = await this.unitOfMeasurementRepository.count(params);

    return {
      results: unitOfMeasurements.map(toUnitOfMeasurementResponse),
      total,
      page: params.page,
      perPage: params.perPage,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };
  }
}
