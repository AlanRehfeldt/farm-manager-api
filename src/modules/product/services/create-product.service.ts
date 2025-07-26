import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../repositories/product.repository';
import { CreateProductData } from '../repositories/@types';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from 'src/modules/unit-of-measurement/repositories/unit-of-measurement.repository';

@Injectable()
export class CreateProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
  ) {}

  async execute({ name, description, unitOfMeasurementId }: CreateProductData) {
    const checkIfUnitOfMeasurementExists =
      await this.unitOfMeasurementRepository.findById(unitOfMeasurementId);
    if (checkIfUnitOfMeasurementExists) {
      throw new NotFoundException('Unit os measurement does not exist');
    }

    const product = await this.productRepository.create({
      name,
      description,
      unitOfMeasurementId,
    });

    return { product };
  }
}
