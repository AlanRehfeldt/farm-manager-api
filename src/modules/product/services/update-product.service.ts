import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from 'src/modules/unit-of-measurement/repositories/unit-of-measurement.repository';
import { UpdateProductData } from '../repositories/@types';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from '../repositories/product.repository';

@Injectable()
export class UpdateProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
  ) {}

  async execute(
    organizationId: string,
    farmId: string,
    { id, name, description, unitOfMeasurementId }: UpdateProductData,
  ) {
    const checkIfProductExists = await this.productRepository.findById(
      id,
      organizationId,
      farmId,
    );
    if (!checkIfProductExists) {
      throw new NotFoundException('Product does not exist');
    }

    if (unitOfMeasurementId) {
      const checkIfUnitOfMeasurementExists =
        await this.unitOfMeasurementRepository.findById(
          unitOfMeasurementId,
          organizationId,
        );
      if (!checkIfUnitOfMeasurementExists) {
        throw new NotFoundException('Unit of measurement does not exist');
      }
    }

    const product = await this.productRepository.update({
      id,
      name,
      description,
      unitOfMeasurementId,
    });

    return { product };
  }
}
