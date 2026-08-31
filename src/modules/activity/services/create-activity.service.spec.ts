import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CropSeasonStatus, type CostCategory } from '@prisma/client';
import { CreateActivityService } from './create-activity.service';
import { ActivityRepository } from '../repositories/activity.repository';
import { CropSeasonRepository } from 'src/modules/crop-season/repositories/crop-season.repository';
import { CropPlantingRepository } from 'src/modules/crop-season/repositories/crop-planting.repository';
import { FieldRepository } from 'src/modules/field/repositories/field.repository';
import { ProductRepository } from 'src/modules/product/repositories/product.repository';
import { UnitOfMeasurementRepository } from 'src/modules/unit-of-measurement/repositories/unit-of-measurement.repository';
import { CostCategoryRepository } from 'src/modules/cost-category/repositories/cost-category.repository';
import { EmployeeRepository } from 'src/modules/employee/repositories/employee.repository';
import { MachineRepository } from 'src/modules/machine/repositories/machine.repository';

describe('CreateActivityService', () => {
  const createActivity = jest.fn();
  const activityRepository: jest.Mocked<ActivityRepository> = {
    create: createActivity,
    findById: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const cropSeasonRepository: jest.Mocked<CropSeasonRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
    countPlantings: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const cropPlantingRepository: jest.Mocked<CropPlantingRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findBySeasonAndField: jest.fn(),
    countBySeasonId: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const fieldRepository: jest.Mocked<FieldRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
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
      searchMany: jest.fn(),
      count: jest.fn(),
    };

  const findByCode = jest.fn<
    ReturnType<CostCategoryRepository['findByCode']>,
    Parameters<CostCategoryRepository['findByCode']>
  >();

  const costCategoryRepository: jest.Mocked<CostCategoryRepository> = {
    upsertSeed: jest.fn(),
    findByCode,
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const employeeRepository: jest.Mocked<EmployeeRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findByRegistration: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const machineRepository: jest.Mocked<MachineRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const service = new CreateActivityService(
    activityRepository,
    cropSeasonRepository,
    cropPlantingRepository,
    fieldRepository,
    productRepository,
    unitOfMeasurementRepository,
    costCategoryRepository,
    employeeRepository,
    machineRepository,
  );

  const farmId = 'farm-id';
  const organizationId = 'org-id';
  const cropSeasonId = 'season-id';
  const fieldId = 'field-id';
  const productId = 'product-id';
  const employeeId = 'employee-id';
  const machineId = 'machine-id';
  const uomId = 'uom-id';
  const userId = 'user-id';
  const categoryId = 'category-id';

  const makeCategory = (code: string, id: string): CostCategory => ({
    id,
    organizationId,
    code,
    name: code,
    parentId: null,
    accountPlanId: null,
    externalRef: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const baseInput = {
    farmId,
    organizationId,
    cropSeasonId,
    fieldId,
    activityType: 'FERTILIZATION' as const,
    date: new Date('2025-08-01'),
    createdByUserId: userId,
    inputs: [] as Array<{ productId: string; quantity: string }>,
    labor: [] as Array<{
      employeeId?: string;
      contractorName?: string;
      payBasis: 'HOUR' | 'DAY' | 'OUTPUT';
      hours?: string;
      days?: string;
      outputQty?: string;
      costInCents: number;
    }>,
    machineHours: [] as Array<{ machineId: string; hours: string }>,
  };

  const emptyActivity = {
    id: 'activity-id',
    farmId,
    cropSeasonId,
    fieldId,
    activityType: 'FERTILIZATION',
    date: baseInput.date,
    note: null,
    createdByUserId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    field: { id: fieldId, name: 'T1' },
    cropSeason: {
      id: cropSeasonId,
      farmId,
      cropId: 'crop-id',
      name: 'Manga 25/26',
      startDate: new Date(),
      endDate: null,
      status: CropSeasonStatus.ACTIVE,
      productionUomId: uomId,
      referenceSalePriceInCents: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      crop: { id: 'crop-id', name: 'Manga' },
    },
    inputs: [],
    labor: [],
    machineHours: [],
    costEntries: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    cropSeasonRepository.findById.mockResolvedValue({
      id: cropSeasonId,
      farmId,
      cropId: 'crop-id',
      name: 'Manga 25/26',
      startDate: new Date(),
      endDate: null,
      status: CropSeasonStatus.ACTIVE,
      productionUomId: uomId,
      referenceSalePriceInCents: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      crop: { id: 'crop-id', name: 'Manga' },
    });
    fieldRepository.findById.mockResolvedValue({
      id: fieldId,
      farmId,
      name: 'T1',
      areaHa: { toString: () => '10' } as never,
      active: true,
      plantsPerHa: null,
      plantedYear: null,
      spacingNote: null,
      externalRef: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    cropPlantingRepository.findBySeasonAndField.mockResolvedValue({
      id: 'planting-id',
      cropSeasonId,
      fieldId,
      varietyId: null,
      plantedAreaHa: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      field: {
        id: fieldId,
        farmId,
        name: 'T1',
        areaHa: { toString: () => '10' } as never,
        active: true,
        plantsPerHa: null,
        plantedYear: null,
        spacingNote: null,
        externalRef: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      variety: null,
    });
    findByCode.mockImplementation((_orgId, code) => {
      const map: Record<string, string> = {
        outros: categoryId,
        MO_fixa: 'mo-fixa-id',
        MO_temporaria: 'mo-temp-id',
        maquina: 'maquina-id',
      };
      const id = map[code];
      return Promise.resolve(id ? makeCategory(code, id) : null);
    });
  });

  it('throws NotFoundException when crop season does not exist', async () => {
    cropSeasonRepository.findById.mockResolvedValue(null);

    await expect(service.execute(baseInput)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws ConflictException when crop season is not active', async () => {
    cropSeasonRepository.findById.mockResolvedValue({
      id: cropSeasonId,
      farmId,
      cropId: 'crop-id',
      name: 'Manga 25/26',
      startDate: new Date(),
      endDate: null,
      status: CropSeasonStatus.PLANNED,
      productionUomId: uomId,
      referenceSalePriceInCents: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      crop: { id: 'crop-id', name: 'Manga' },
    });

    await expect(service.execute(baseInput)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('throws BadRequestException when field is not planted in season', async () => {
    cropPlantingRepository.findBySeasonAndField.mockResolvedValue(null);

    await expect(service.execute(baseInput)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('throws NotFoundException when product does not exist', async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({
        ...baseInput,
        inputs: [{ productId, quantity: '100' }],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates activity without inputs', async () => {
    createActivity.mockResolvedValue({
      activity: emptyActivity,
      stockEffects: [],
    });

    const result = await service.execute(baseInput);

    expect(createActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        farmId,
        cropSeasonId,
        fieldId,
        inputs: [],
        labor: [],
        machineHours: [],
        costCategoryIds: {
          defaultInput: categoryId,
          moFixa: 'mo-fixa-id',
          moTemporaria: 'mo-temp-id',
          maquina: 'maquina-id',
        },
      }),
    );
    expect(result.activity.id).toBe('activity-id');
    expect(result.activity.stockEffects).toEqual([]);
  });

  it('creates activity with inputs and returns stock effects', async () => {
    productRepository.findById.mockResolvedValue({
      id: productId,
      organizationId,
      farmId: null,
      name: 'Ureia',
      description: null,
      unitOfMeasurementId: uomId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    unitOfMeasurementRepository.findById.mockResolvedValue({
      id: uomId,
      organizationId,
      name: 'Quilograma',
      acronym: 'kg',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    createActivity.mockResolvedValue({
      activity: {
        ...emptyActivity,
        inputs: [
          {
            id: 'input-id',
            activityId: 'activity-id',
            productId,
            quantity: { toString: () => '100' } as never,
            unitCostSnapshot: { toString: () => '3.5' } as never,
            createdAt: new Date(),
            updatedAt: new Date(),
            product: {
              id: productId,
              name: 'Ureia',
              unitOfMeasurement: { id: uomId, acronym: 'kg' },
            },
          },
        ],
        costEntries: [
          {
            id: 'ce-id',
            farmId,
            cropSeasonId,
            fieldId,
            activityId: 'activity-id',
            sourceType: 'ACTIVITY_INPUT',
            sourceId: 'input-id',
            costCategoryId: categoryId,
            amountInCents: 35000n,
            quantity: { toString: () => '100' } as never,
            uomId,
            date: baseInput.date,
            reversedAt: null,
            reversalOfId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
      stockEffects: [
        {
          productName: 'Ureia',
          quantity: '100',
          uomAcronym: 'kg',
          quantityRemaining: '50',
          amountInCents: 35000,
        },
      ],
    });

    const result = await service.execute({
      ...baseInput,
      inputs: [{ productId, quantity: '100' }],
    });

    expect(result.activity.stockEffects).toHaveLength(1);
    expect(result.activity.totalCostInCents).toBe(35000);
  });

  it('creates activity with labor line', async () => {
    employeeRepository.findById.mockResolvedValue({
      id: employeeId,
      organizationId,
      farmId,
      name: 'João',
      registration: '001',
      type: 'FIELD_WORKER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    createActivity.mockResolvedValue({
      activity: {
        ...emptyActivity,
        labor: [
          {
            id: 'labor-id',
            activityId: 'activity-id',
            employeeId,
            contractorName: null,
            payBasis: 'HOUR',
            hours: { toString: () => '4' } as never,
            days: null,
            outputQty: null,
            costInCents: 20000n,
            createdAt: new Date(),
            updatedAt: new Date(),
            employee: { id: employeeId, name: 'João' },
          },
        ],
        costEntries: [
          {
            id: 'ce-labor',
            farmId,
            cropSeasonId,
            fieldId,
            activityId: 'activity-id',
            sourceType: 'ACTIVITY_LABOR',
            sourceId: 'labor-id',
            costCategoryId: 'mo-fixa-id',
            amountInCents: 20000n,
            quantity: null,
            uomId: null,
            date: baseInput.date,
            reversedAt: null,
            reversalOfId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
      stockEffects: [],
    });

    const result = await service.execute({
      ...baseInput,
      labor: [
        {
          employeeId,
          payBasis: 'HOUR',
          hours: '4',
          costInCents: 20000,
        },
      ],
    });

    expect(result.activity.labor).toHaveLength(1);
    expect(result.activity.totalCostInCents).toBe(20000);
  });

  it('creates activity with machine hours', async () => {
    machineRepository.findById.mockResolvedValue({
      id: machineId,
      farmId,
      name: 'Trator',
      hourlyCostInCents: 5000n,
      fuelIncludedInHourlyCost: true,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    createActivity.mockResolvedValue({
      activity: {
        ...emptyActivity,
        machineHours: [
          {
            id: 'machine-hour-id',
            activityId: 'activity-id',
            machineId,
            hours: { toString: () => '3' } as never,
            hourlyCostSnapshot: 5000n,
            costInCents: 15000n,
            createdAt: new Date(),
            updatedAt: new Date(),
            machine: { id: machineId, name: 'Trator' },
          },
        ],
        costEntries: [
          {
            id: 'ce-machine',
            farmId,
            cropSeasonId,
            fieldId,
            activityId: 'activity-id',
            sourceType: 'ACTIVITY_MACHINE',
            sourceId: 'machine-hour-id',
            costCategoryId: 'maquina-id',
            amountInCents: 15000n,
            quantity: { toString: () => '3' } as never,
            uomId: null,
            date: baseInput.date,
            reversedAt: null,
            reversalOfId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
      stockEffects: [],
    });

    const result = await service.execute({
      ...baseInput,
      machineHours: [{ machineId, hours: '3' }],
    });

    expect(result.activity.machineHours).toHaveLength(1);
    expect(result.activity.totalCostInCents).toBe(15000);
  });

  it('throws BadRequestException when machine is inactive', async () => {
    machineRepository.findById.mockResolvedValue({
      id: machineId,
      farmId,
      name: 'Trator',
      hourlyCostInCents: 5000n,
      fuelIncludedInHourlyCost: true,
      active: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.execute({
        ...baseInput,
        machineHours: [{ machineId, hours: '3' }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
