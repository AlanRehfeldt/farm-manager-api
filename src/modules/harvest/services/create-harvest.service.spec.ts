import { BadRequestException, ConflictException } from '@nestjs/common';
import { UomDimension } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateHarvestService } from './create-harvest.service';
import { HarvestRepository } from '../repositories/harvest.repository';
import type {
  CreateHarvestData,
  CreateHarvestResult,
} from '../repositories/@types';
import { CropSeasonRepository } from 'src/modules/crop-season/repositories/crop-season.repository';
import { CropPlantingRepository } from 'src/modules/crop-season/repositories/crop-planting.repository';
import { UnitOfMeasurementRepository } from 'src/modules/unit-of-measurement/repositories/unit-of-measurement.repository';
import { UOM_DIMENSION_MISMATCH } from 'src/modules/unit-of-measurement/domain/uom-conversion';

describe('CreateHarvestService', () => {
  const createHarvest = jest.fn<
    ReturnType<HarvestRepository['create']>,
    Parameters<HarvestRepository['create']>
  >();
  const harvestRepository: jest.Mocked<HarvestRepository> = {
    create: createHarvest,
    findById: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
    sumSeasonQuantity: jest.fn(),
  };

  const cropSeasonRepository: jest.Mocked<CropSeasonRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
    countPlantings: jest.fn(),
    hasOperationalData: jest.fn(),
    countHarvests: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const cropPlantingRepository: jest.Mocked<CropPlantingRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findBySeasonAndField: jest.fn(),
    findAllBySeason: jest.fn(),
    countBySeasonId: jest.fn(),
    hasFieldOperations: jest.fn(),
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

  const service = new CreateHarvestService(
    harvestRepository,
    cropSeasonRepository,
    cropPlantingRepository,
    unitOfMeasurementRepository,
  );

  const organizationId = 'org-1';

  const baseInput = {
    farmId: 'farm-1',
    organizationId,
    cropSeasonId: 'season-1',
    fieldId: 'field-1',
    date: new Date('2026-08-15'),
    items: [
      {
        qualityClass: 'OTHER' as const,
        quantity: '20000',
        uomId: 'uom-kg',
      },
    ],
  };

  const kgUom = {
    id: 'uom-kg',
    organizationId,
    name: 'Quilograma',
    acronym: 'kg',
    dimension: UomDimension.MASS,
    isBase: true,
    factorToBase: new Decimal(1),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const boxUom = {
    id: 'uom-box',
    organizationId,
    name: 'Caixa 4,5 kg',
    acronym: 'cx',
    dimension: UomDimension.MASS,
    isBase: false,
    factorToBase: new Decimal(4.5),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const literUom = {
    id: 'uom-l',
    organizationId,
    name: 'Litro',
    acronym: 'L',
    dimension: UomDimension.VOLUME,
    isBase: true,
    factorToBase: new Decimal(1),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    cropSeasonRepository.findById.mockResolvedValue({
      id: 'season-1',
      productionUomId: 'uom-kg',
      status: 'ACTIVE',
    } as never);
    cropPlantingRepository.findBySeasonAndField.mockResolvedValue({
      id: 'planting-1',
    } as never);
    unitOfMeasurementRepository.findById.mockImplementation((id: string) => {
      if (id === 'uom-kg') return Promise.resolve(kgUom);
      if (id === 'uom-box') return Promise.resolve(boxUom);
      if (id === 'uom-l') return Promise.resolve(literUom);
      return Promise.resolve(null);
    });
    createHarvest.mockResolvedValue({
      harvest: {
        id: 'harvest-1',
        farmId: 'farm-1',
        cropSeasonId: 'season-1',
        fieldId: 'field-1',
        date: baseInput.date,
        lotCode: null,
        note: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        cropSeason: {
          id: 'season-1',
          name: 'Safra 25/26',
          status: 'ACTIVE',
          productionUomId: 'uom-kg',
        },
        field: {
          id: 'field-1',
          name: 'T1',
          areaHa: new Decimal('10'),
        },
        items: [
          {
            id: 'item-1',
            qualityClass: 'OTHER',
            quantity: new Decimal('20000'),
            uomId: 'uom-kg',
            uom: { id: 'uom-kg', name: 'Quilograma', acronym: 'kg' },
          },
        ],
      },
    } as CreateHarvestResult);
  });

  it('creates harvest for active season and planted field', async () => {
    const result = await service.execute(baseInput);

    expect(createHarvest).toHaveBeenCalled();
    expect(result.harvest.totalQuantity).toBe('20000');
  });

  it('converts compatible UoM to production UoM', async () => {
    await service.execute({
      ...baseInput,
      items: [{ ...baseInput.items[0], quantity: '2', uomId: 'uom-box' }],
    });

    expect(createHarvest).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            quantity: '9',
            uomId: 'uom-kg',
          }),
        ],
      }),
    );
  });

  it('rejects non-positive quantity', async () => {
    await expect(
      service.execute({
        ...baseInput,
        items: [{ ...baseInput.items[0], quantity: '0' }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects inactive crop season', async () => {
    cropSeasonRepository.findById.mockResolvedValue({
      id: 'season-1',
      productionUomId: 'uom-kg',
      status: 'CLOSED',
    } as never);

    await expect(service.execute(baseInput)).rejects.toThrow(ConflictException);
  });

  it('rejects field not planted in season', async () => {
    cropPlantingRepository.findBySeasonAndField.mockResolvedValue(null);

    await expect(service.execute(baseInput)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects cross-dimension UoM with UOM_DIMENSION_MISMATCH', async () => {
    await expect(
      service.execute({
        ...baseInput,
        items: [{ ...baseInput.items[0], uomId: 'uom-l' }],
      }),
    ).rejects.toThrow(UOM_DIMENSION_MISMATCH);
  });

  it('does not call cost entry writer (repository only creates harvest)', async () => {
    await service.execute(baseInput);

    expect(createHarvest).toHaveBeenCalledTimes(1);
    const callArg: CreateHarvestData | undefined =
      createHarvest.mock.calls[0]?.[0];
    expect(callArg).toBeDefined();
    expect(callArg).not.toHaveProperty('costEntries');
  });
});
