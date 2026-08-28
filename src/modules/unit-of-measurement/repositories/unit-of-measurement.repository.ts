import { UnitOfMeasurement } from '@prisma/client';
import {
  CreateUnitOfMeasurementData,
  SearchManyQuery,
  UpdateUnitOfMeasurementData,
} from './@types';

export interface UnitOfMeasurementRepository {
  create(data: CreateUnitOfMeasurementData): Promise<UnitOfMeasurement>;
  update(data: UpdateUnitOfMeasurementData): Promise<UnitOfMeasurement>;
  delete(id: string): Promise<void>;
  findById(
    id: string,
    organizationId: string,
  ): Promise<UnitOfMeasurement | null>;
  findByAcronym(
    organizationId: string,
    acronym: string,
  ): Promise<UnitOfMeasurement | null>;
  searchMany(query: SearchManyQuery): Promise<UnitOfMeasurement[]>;
  count(query: SearchManyQuery): Promise<number>;
}

export const UNIT_OF_MEASUREMENT_REPOSITORY = 'UNIT_OF_MEASUREMENT_REPOSITORY';
