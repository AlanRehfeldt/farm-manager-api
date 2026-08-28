import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../repositories/product.repository';

@Injectable()
export class GetProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: string, organizationId: string, farmId: string) {
    const product = await this.productRepository.findById(
      id,
      organizationId,
      farmId,
    );

    if (!product) {
      throw new NotFoundException('Product does not exist');
    }

    return { product };
  }
}
