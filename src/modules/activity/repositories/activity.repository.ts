import {
  CreateActivityData,
  CreateActivityResult,
  ActivityWithRelations,
  SearchManyActivitiesQuery,
} from './@types';

export interface ActivityRepository {
  create(data: CreateActivityData): Promise<CreateActivityResult>;
  findById(id: string, farmId: string): Promise<ActivityWithRelations | null>;
  searchMany(
    query: SearchManyActivitiesQuery,
  ): Promise<ActivityWithRelations[]>;
  count(query: SearchManyActivitiesQuery): Promise<number>;
  hasEmployeeLaborInSeasonMonth(
    employeeId: string,
    cropSeasonId: string,
    year: number,
    month: number,
  ): Promise<boolean>;
}

export const ACTIVITY_REPOSITORY = 'ACTIVITY_REPOSITORY';
