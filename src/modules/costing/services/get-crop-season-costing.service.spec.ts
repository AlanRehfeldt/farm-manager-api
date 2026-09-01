import { ConflictException, NotFoundException } from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import { GetCropSeasonCostingService } from './get-crop-season-costing.service';
import { CostingRepository } from '../repositories/costing.repository';

describe('GetCropSeasonCostingService', () => {
  const findCostEntries = jest.fn<
    ReturnType<CostingRepository['findCostEntries']>,
    Parameters<CostingRepository['findCostEntries']>
  >();

  const costingRepository: jest.Mocked<CostingRepository> = {
    findSeasonContext: jest.fn(),
    findCostEntries,
    findPlantings: jest.fn(),
    findFieldHarvests: jest.fn(),
    findSnapshot: jest.fn(),
    closeSeason: jest.fn(),
    reopenSeason: jest.fn(),
    updateReferencePrice: jest.fn(),
  };

  const service = new GetCropSeasonCostingService(costingRepository);

  const farmId = 'farm-id';
  const seasonId = 'season-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws NotFoundException when crop season does not exist', async () => {
    costingRepository.findSeasonContext.mockResolvedValue(null);

    await expect(service.execute(seasonId, farmId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns snapshot for closed season', async () => {
    const snapshotPayload = {
      cropSeasonId: seasonId,
      status: CropSeasonStatus.CLOSED,
      source: 'SNAPSHOT' as const,
      closedAt: '2026-08-31T00:00:00.000Z',
      totalCostInCents: 44000000,
      areaHa: '40',
      harvestedQuantity: '800000',
      productionUomId: 'uom-id',
      productionUomAcronym: 'kg',
      costPerHaInCents: 1100000,
      costPerUnitInCents: 55,
      referenceSalePriceInCents: 120,
      estimatedMarginPerUnitInCents: 65,
      breakdownByCategory: [],
      breakdownBySource: [],
      byField: [],
    };

    costingRepository.findSeasonContext.mockResolvedValue({
      id: seasonId,
      farmId,
      status: CropSeasonStatus.CLOSED,
      productionUomId: 'uom-id',
      productionUomAcronym: 'kg',
      referenceSalePriceInCents: 120n,
    });
    costingRepository.findSnapshot.mockResolvedValue({
      cropSeasonId: seasonId,
      payload: snapshotPayload,
      closedAt: new Date('2026-08-31'),
      closedByUserId: 'user-id',
    });

    const result = await service.execute(seasonId, farmId);

    expect(result.costing).toEqual(snapshotPayload);
    expect(findCostEntries).not.toHaveBeenCalled();
  });

  it('throws ConflictException when closed season has no snapshot', async () => {
    costingRepository.findSeasonContext.mockResolvedValue({
      id: seasonId,
      farmId,
      status: CropSeasonStatus.CLOSED,
      productionUomId: 'uom-id',
      productionUomAcronym: 'kg',
      referenceSalePriceInCents: null,
    });
    costingRepository.findSnapshot.mockResolvedValue(null);

    await expect(service.execute(seasonId, farmId)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('returns live costing for active season', async () => {
    costingRepository.findSeasonContext.mockResolvedValue({
      id: seasonId,
      farmId,
      status: CropSeasonStatus.ACTIVE,
      productionUomId: 'uom-id',
      productionUomAcronym: 'kg',
      referenceSalePriceInCents: null,
    });
    costingRepository.findCostEntries.mockResolvedValue([]);
    costingRepository.findPlantings.mockResolvedValue([]);
    costingRepository.findFieldHarvests.mockResolvedValue([]);

    const result = await service.execute(seasonId, farmId);

    expect(result.costing.source).toBe('LIVE');
    expect(result.costing.status).toBe('ACTIVE');
    expect(result.costing.totalCostInCents).toBe(0);
  });
});
