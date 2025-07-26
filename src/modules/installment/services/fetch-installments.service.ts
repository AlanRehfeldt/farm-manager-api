import { Inject, Injectable } from '@nestjs/common';
import {
  INSTALLMENT_REPOSITORY,
  InstallmentRepository,
} from '../repositories/installment.repository';
import { SearchManyQuery } from '../repositories/@types';

@Injectable()
export class FetchInstallmentsService {
  constructor(
    @Inject(INSTALLMENT_REPOSITORY)
    private readonly installmentRepository: InstallmentRepository,
  ) {}

  async execute(params: SearchManyQuery) {
    const installments = await this.installmentRepository.searchMany(params);
    const total = await this.installmentRepository.count(params);

    return {
      results: installments,
      total,
      page: params.page,
      perPage: params.perPage,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };
  }
}
