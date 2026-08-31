import { Inject, Injectable } from '@nestjs/common';
import { ActivityType } from '@prisma/client';
import { toActivityResponse } from '../mappers/activity.mapper';
import {
  ACTIVITY_REPOSITORY,
  ActivityRepository,
} from '../repositories/activity.repository';

type FetchActivitiesInput = {
  farmId: string;
  cropSeasonId: string;
  name?: string;
  activityType?: ActivityType;
  dateFrom?: Date;
  dateTo?: Date;
  page: number;
  perPage: number;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
};

@Injectable()
export class FetchActivitiesService {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: ActivityRepository,
  ) {}

  async execute(input: FetchActivitiesInput) {
    const query = {
      farmId: input.farmId,
      cropSeasonId: input.cropSeasonId,
      name: input.name,
      activityType: input.activityType,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      page: input.page,
      perPage: input.perPage,
      orderBy: input.orderBy,
      orderDirection: input.orderDirection,
    };

    const [results, total] = await Promise.all([
      this.activityRepository.searchMany(query),
      this.activityRepository.count(query),
    ]);

    return {
      results: results.map(toActivityResponse),
      total,
      page: input.page,
      perPage: input.perPage,
      orderBy: input.orderBy,
      orderDirection: input.orderDirection,
    };
  }
}
