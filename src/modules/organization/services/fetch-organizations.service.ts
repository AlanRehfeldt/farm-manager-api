import { Inject, Injectable } from '@nestjs/common';
import { SearchManyQuery } from '../repositories/@types';
import {
  ORGANIZATION_REPOSITORY,
  OrganizationRepository,
} from '../repositories/organization.repository';

@Injectable()
export class FetchOrganizationsService {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(userId: string, params: SearchManyQuery) {
    const results = await this.organizationRepository.searchManyForUser(
      userId,
      params,
    );
    const total = await this.organizationRepository.countForUser(
      userId,
      params,
    );

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
