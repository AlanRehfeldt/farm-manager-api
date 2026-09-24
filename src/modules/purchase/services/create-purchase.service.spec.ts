import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UomDimension } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CreatePurchaseService } from './create-purchase.service';
import { PurchaseRepository } from '../repositories/purchase.repository';
import { ProductRepository } from 'src/modules/product/repositories/product.repository';
import { SupplierRepository } from 'src/modules/supplier/repositories/supplier.repository';
import { UnitOfMeasurementRepository } from 'src/modules/unit-of-measurement/repositories/unit-of-measurement.repository';

describe('CreatePurchaseService', () => {
  const createPurchase = jest.fn();
  const purchaseRepository: jest.Mocked<PurchaseRepository> = {
    create: createPurchase,
    findById: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const supplierRepository: jest.Mocked<SupplierRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findByCnpj: jest.fn(),
    findByCpf: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const productRepository: jest.Mocked<ProductRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const unitOfMeasurementRepository: jest.Mocked<UnitOfMeasurementRepository> =
    {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByAcronym: jest.fn(),
      findBaseByDimension: jest.fn(),
      searchMany: jest.fn(),
      count: jest.fn(),
    };

  const service = new CreatePurchaseService(
    purchaseRepository,
    supplierRepository,
    productRepository,
    unitOfMeasurementRepository,
  );

  const farmId = 'farm-id';
  const organizationId = 'org-id';
  const supplierId = 'supplier-id';
  const productId = 'product-id';
  const uomId = 'uom-id';

  const baseInput = {
    farmId,
    organizationId,
    date: new Date('2025-08-01'),
    supplierId,
    items: [
      {
        productId,
        quantity: '1000',
        priceInCents: 350,
      },
    ],
    installments: [
      {
        valueInCents: 350000,
        dueDate: new Date('2025-09-01'),
        paymentForm: 'PIX' as const,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws NotFoundException when supplier does not exist', async () => {
    supplierRepository.findById.mockResolvedValue(null);

    await expect(service.execute(baseInput)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws NotFoundException when product does not exist', async () => {
    supplierRepository.findById.mockResolvedValue({
      id: supplierId,
      organizationId,
      farmId: null,
      name: 'Fornecedor',
      cnpj: '12345678901234',
      cpf: null,
      address: null,
      city: null,
      state: null,
      phoneNumber: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    productRepository.findById.mockResolvedValue(null);

    await expect(service.execute(baseInput)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws BadRequestException when installments total does not match items total', async () => {
    supplierRepository.findById.mockResolvedValue({
      id: supplierId,
      organizationId,
      farmId: null,
      name: 'Fornecedor',
      cnpj: '12345678901234',
      cpf: null,
      address: null,
      city: null,
      state: null,
      phoneNumber: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    productRepository.findById.mockResolvedValue({
      id: productId,
      organizationId,
      farmId: null,
      name: 'Ureia',
      description: null,
      unitOfMeasurementId: uomId,
      costCategoryId: 'outros-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    unitOfMeasurementRepository.findById.mockResolvedValue({
      id: uomId,
      organizationId,
      name: 'Quilograma',
      acronym: 'kg',
      dimension: UomDimension.MASS,
      isBase: true,
      factorToBase: new Decimal(1),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.execute({
        ...baseInput,
        installments: [
          {
            valueInCents: 100,
            dueDate: new Date('2025-09-01'),
            paymentForm: 'PIX',
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates purchase and returns stock effects on happy path', async () => {
    supplierRepository.findById.mockResolvedValue({
      id: supplierId,
      organizationId,
      farmId: null,
      name: 'Fornecedor',
      cnpj: '12345678901234',
      cpf: null,
      address: null,
      city: null,
      state: null,
      phoneNumber: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    productRepository.findById.mockResolvedValue({
      id: productId,
      organizationId,
      farmId: null,
      name: 'Ureia',
      description: null,
      unitOfMeasurementId: uomId,
      costCategoryId: 'outros-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    unitOfMeasurementRepository.findById.mockResolvedValue({
      id: uomId,
      organizationId,
      name: 'Quilograma',
      acronym: 'kg',
      dimension: UomDimension.MASS,
      isBase: true,
      factorToBase: new Decimal(1),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const mockPurchase = {
      id: 'purchase-id',
      documentRef: null,
      supplierId,
      transactionId: 'transaction-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      supplier: {
        id: supplierId,
        organizationId,
        farmId: null,
        name: 'Fornecedor',
        cnpj: '12345678901234',
        address: null,
        phoneNumber: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      transaction: {
        id: 'transaction-id',
        farmId,
        type: 'PURCHASE_INPUT' as const,
        date: baseInput.date,
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        installments: [
          {
            id: 'inst-id',
            valueInCents: 350000n,
            dueDate: baseInput.installments[0].dueDate,
            paymentDate: null,
            paymentForm: 'PIX' as const,
            manuallyAdjusted: false,
            transactionId: 'transaction-id',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
      purchaseTransactionProducts: [
        {
          id: 'item-id',
          quantity: new Decimal(1000),
          priceInCents: 350n,
          productId,
          purchaseTransactionId: 'purchase-id',
          createdAt: new Date(),
          updatedAt: new Date(),
          product: {
            id: productId,
            name: 'Ureia',
            unitOfMeasurement: { id: uomId, acronym: 'kg' },
          },
        },
      ],
    };

    createPurchase.mockResolvedValue({
      purchase: mockPurchase as never,
      stockEffects: [
        {
          productName: 'Ureia',
          quantity: '1000',
          uomAcronym: 'kg',
          avgCost: '3.5',
        },
      ],
    });

    const result = await service.execute(baseInput);

    expect(createPurchase).toHaveBeenCalledWith(
      expect.objectContaining({
        farmId,
        supplierId,
        items: baseInput.items,
        installments: [
          expect.objectContaining({
            valueInCents: 350000,
            paymentForm: 'PIX',
          }),
        ],
      }),
    );
    expect(result.purchase.stockEffects).toHaveLength(1);
    expect(result.purchase.stockEffects[0].productName).toBe('Ureia');
    expect(result.purchase.installments[0].manuallyAdjusted).toBe(false);
  });

  it('passes manuallyAdjusted installments to the repository', async () => {
    supplierRepository.findById.mockResolvedValue({
      id: supplierId,
      organizationId,
      farmId: null,
      name: 'Fornecedor',
      cnpj: '12345678901234',
      cpf: null,
      address: null,
      city: null,
      state: null,
      phoneNumber: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    productRepository.findById.mockResolvedValue({
      id: productId,
      organizationId,
      farmId: null,
      name: 'Ureia',
      description: null,
      unitOfMeasurementId: uomId,
      costCategoryId: 'outros-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    unitOfMeasurementRepository.findById.mockResolvedValue({
      id: uomId,
      organizationId,
      name: 'Quilograma',
      acronym: 'kg',
      dimension: UomDimension.MASS,
      isBase: true,
      factorToBase: new Decimal(1),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const dueDate = new Date('2025-09-01');
    createPurchase.mockResolvedValue({
      purchase: {
        id: 'purchase-id',
        documentRef: null,
        supplierId,
        transactionId: 'transaction-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        supplier: {
          id: supplierId,
          organizationId,
          farmId: null,
          name: 'Fornecedor',
          cnpj: '12345678901234',
          cpf: null,
          address: null,
          city: null,
          state: null,
          phoneNumber: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        transaction: {
          id: 'transaction-id',
          farmId,
          type: 'PURCHASE_INPUT' as const,
          date: baseInput.date,
          note: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          installments: [
            {
              id: 'inst-1',
              valueInCents: 40000n,
              dueDate,
              paymentDate: null,
              paymentForm: 'PIX' as const,
              manuallyAdjusted: true,
              transactionId: 'transaction-id',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'inst-2',
              valueInCents: 310000n,
              dueDate,
              paymentDate: null,
              paymentForm: 'PIX' as const,
              manuallyAdjusted: false,
              transactionId: 'transaction-id',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
        purchaseTransactionProducts: [
          {
            id: 'item-id',
            quantity: new Decimal(1000),
            priceInCents: 350n,
            productId,
            purchaseTransactionId: 'purchase-id',
            createdAt: new Date(),
            updatedAt: new Date(),
            product: {
              id: productId,
              name: 'Ureia',
              unitOfMeasurement: { id: uomId, acronym: 'kg' },
            },
          },
        ],
      } as never,
      stockEffects: [
        {
          productName: 'Ureia',
          quantity: '1000',
          uomAcronym: 'kg',
          avgCost: '3.5',
        },
      ],
    });

    const result = await service.execute({
      ...baseInput,
      installments: [
        {
          valueInCents: 40000,
          dueDate,
          paymentForm: 'PIX',
          manuallyAdjusted: true,
        },
        {
          valueInCents: 310000,
          dueDate,
          paymentForm: 'PIX',
          manuallyAdjusted: false,
        },
      ],
    });

    expect(createPurchase).toHaveBeenCalledWith(
      expect.objectContaining({
        installments: [
          expect.objectContaining({
            valueInCents: 40000,
            manuallyAdjusted: true,
          }),
          expect.objectContaining({
            valueInCents: 310000,
            manuallyAdjusted: false,
          }),
        ],
      }),
    );
    expect(result.purchase.installments[0].manuallyAdjusted).toBe(true);
    expect(result.purchase.installments[1].manuallyAdjusted).toBe(false);
  });
});
