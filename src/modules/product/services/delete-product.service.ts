import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../repositories/product.repository';

@Injectable()
export class DeleteProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: string, organizationId: string, farmId: string) {
    const checkIfProductExists = await this.productRepository.findById(
      id,
      organizationId,
      farmId,
    );
    if (!checkIfProductExists) {
      throw new NotFoundException('Product does not exist');
    }

    return await this.productRepository.delete(id);
  }
}
