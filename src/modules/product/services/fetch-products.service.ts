import { Inject, Injectable } from '@nestjs/common';
import { SearchManyQuery } from '../repositories/@types';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../repositories/product.repository';

@Injectable()
export class FetchProductsService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(params: SearchManyQuery) {
    const products = await this.productRepository.searchMany(params);
    const total = await this.productRepository.count(params);

    return {
      results: products,
      total,
      page: params.page,
      perPage: params.perPage,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };
  }
}
