import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateStockAdjustmentService } from './create-stock-adjustment.service';
import { StockMovementRepository } from '../repositories/stock-movement.repository';
import { ProductRepository } from 'src/modules/product/repositories/product.repository';

describe('CreateStockAdjustmentService', () => {
  const createAdjustment = jest.fn();
  const stockMovementRepository: jest.Mocked<StockMovementRepository> = {
    createAdjustment,
  };

  const productRepository: jest.Mocked<ProductRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const service = new CreateStockAdjustmentService(
    stockMovementRepository,
    productRepository,
  );

  const farmId = 'farm-id';
  const organizationId = 'org-id';
  const productId = 'product-id';

  const baseInput = {
    farmId,
    organizationId,
    productId,
    quantity: '-5',
    date: new Date('2025-08-01'),
    note: 'quebra',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    productRepository.findById.mockResolvedValue({
      id: productId,
      organizationId,
      farmId: null,
      name: 'Ureia',
      description: null,
      unitOfMeasurementId: 'uom-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('throws BadRequestException when quantity is zero', async () => {
    await expect(
      service.execute({ ...baseInput, quantity: '0' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when note is empty', async () => {
    await expect(
      service.execute({ ...baseInput, note: '   ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFoundException when product does not exist', async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(service.execute(baseInput)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates adjustment and returns result', async () => {
    createAdjustment.mockResolvedValue({
      movement: {
        id: 'movement-id',
        farmId,
        type: 'ADJUSTMENT',
        productId,
        date: baseInput.date,
        quantity: { toString: () => '5' } as never,
        note: 'quebra',
        transactionId: null,
        sourceType: 'ADJUSTMENT',
        sourceId: 'movement-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      quantityOnHand: '95',
      avgCost: '3.5',
    });

    const result = await service.execute(baseInput);

    expect(createAdjustment).toHaveBeenCalledWith(
      expect.objectContaining({
        farmId,
        productId,
        quantity: '-5',
        note: 'quebra',
      }),
    );
    expect(result.quantityOnHand).toBe('95');
    expect(result.productName).toBe('Ureia');
  });
});
