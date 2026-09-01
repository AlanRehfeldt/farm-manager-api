import { Inject, Injectable } from '@nestjs/common';
import { toActivityResponse } from '../mappers/activity.mapper';
import {
  ACTIVITY_REPOSITORY,
  ActivityRepository,
} from '../repositories/activity.repository';

type ReverseActivityInput = {
  activityId: string;
  farmId: string;
  reason: string;
};

@Injectable()
export class ReverseActivityService {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: ActivityRepository,
  ) {}

  async execute(input: ReverseActivityInput) {
    const reversedAt = new Date();

    const { activity } = await this.activityRepository.reverse({
      activityId: input.activityId,
      farmId: input.farmId,
      reason: input.reason,
      reversedAt,
    });

    return { activity: toActivityResponse(activity) };
  }
}
