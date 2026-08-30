import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { toActivityResponse } from '../mappers/activity.mapper';
import {
  ACTIVITY_REPOSITORY,
  ActivityRepository,
} from '../repositories/activity.repository';

@Injectable()
export class GetActivityService {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: ActivityRepository,
  ) {}

  async execute(id: string, farmId: string) {
    const activity = await this.activityRepository.findById(id, farmId);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return {
      activity: toActivityResponse(activity),
    };
  }
}
