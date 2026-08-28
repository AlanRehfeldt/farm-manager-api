import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { SearchManyQuery } from '../repositories/@types';
import {
  MEMBERSHIP_REPOSITORY,
  MembershipRepository,
} from '../repositories/membership.repository';

@Injectable()
export class FetchMembershipsService {
  constructor(
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async execute(actorUserId: string, params: SearchManyQuery) {
    const admin = await this.membershipRepository.findOrgAdmin(
      actorUserId,
      params.organizationId,
    );

    if (!admin) {
      throw new ForbiddenException(
        'Only organization admins can list memberships',
      );
    }

    const results = await this.membershipRepository.searchMany(params);
    const total = await this.membershipRepository.count(params);

    return {
      results,
      total,
      page: params.page,
      perPage: params.perPage,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };
  }
}
