import { BadRequestException, ConflictException } from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateHarvestService } from './create-harvest.service';
import { HarvestRepository } from '../repositories/harvest.repository';
import type {
  CreateHarvestData,
  CreateHarvestResult,
} from '../repositories/@types';
import { CropSeasonRepository } from 'src/modules/crop-season/repositories/crop-season.repository';
import { CropPlantingRepository } from 'src/modules/crop-season/repositories/crop-planting.repository';

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

  const service = new CreateHarvestService(
    harvestRepository,
    cropSeasonRepository,
    cropPlantingRepository,
  );

  const baseInput = {
    farmId: 'farm-1',
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

  beforeEach(() => {
    jest.clearAllMocks();
    cropSeasonRepository.findById.mockResolvedValue({
      id: 'season-1',
      productionUomId: 'uom-kg',
      status: CropSeasonStatus.ACTIVE,
    } as never);
    cropPlantingRepository.findBySeasonAndField.mockResolvedValue({
      id: 'planting-1',
    } as never);
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
          status: CropSeasonStatus.ACTIVE,
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
      status: CropSeasonStatus.CLOSED,
    } as never);

    await expect(service.execute(baseInput)).rejects.toThrow(ConflictException);
  });

  it('rejects field not planted in season', async () => {
    cropPlantingRepository.findBySeasonAndField.mockResolvedValue(null);

    await expect(service.execute(baseInput)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects mismatched production uom', async () => {
    await expect(
      service.execute({
        ...baseInput,
        items: [{ ...baseInput.items[0], uomId: 'uom-box' }],
      }),
    ).rejects.toThrow(BadRequestException);
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
