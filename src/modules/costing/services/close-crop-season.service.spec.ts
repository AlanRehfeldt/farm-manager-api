import { ConflictException, NotFoundException } from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import { CloseCropSeasonService } from './close-crop-season.service';
import { CostingRepository } from '../repositories/costing.repository';

describe('CloseCropSeasonService', () => {
  const closeSeason = jest.fn<
    ReturnType<CostingRepository['closeSeason']>,
    Parameters<CostingRepository['closeSeason']>
  >();

  const costingRepository: jest.Mocked<CostingRepository> = {
    findSeasonContext: jest.fn(),
    findCostEntries: jest.fn(),
    findPlantings: jest.fn(),
    findFieldHarvests: jest.fn(),
    findSnapshot: jest.fn(),
    closeSeason,
    reopenSeason: jest.fn(),
    updateReferencePrice: jest.fn(),
  };

  const service = new CloseCropSeasonService(costingRepository);

  const farmId = 'farm-id';
  const seasonId = 'season-id';
  const userId = 'user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws NotFoundException when crop season does not exist', async () => {
    costingRepository.findSeasonContext.mockResolvedValue(null);

    await expect(
      service.execute(seasonId, farmId, userId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ConflictException when crop season is already closed', async () => {
    costingRepository.findSeasonContext.mockResolvedValue({
      id: seasonId,
      farmId,
      status: CropSeasonStatus.CLOSED,
      productionUomId: 'uom-id',
      productionUomAcronym: 'kg',
      referenceSalePriceInCents: null,
    });

    await expect(
      service.execute(seasonId, farmId, userId),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws ConflictException when crop season is planned', async () => {
    costingRepository.findSeasonContext.mockResolvedValue({
      id: seasonId,
      farmId,
      status: CropSeasonStatus.PLANNED,
      productionUomId: 'uom-id',
      productionUomAcronym: 'kg',
      referenceSalePriceInCents: null,
    });

    await expect(
      service.execute(seasonId, farmId, userId),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('closes active season with zero harvest', async () => {
    costingRepository.findSeasonContext.mockResolvedValue({
      id: seasonId,
      farmId,
      status: CropSeasonStatus.ACTIVE,
      productionUomId: 'uom-id',
      productionUomAcronym: 'kg',
      referenceSalePriceInCents: 120n,
    });
    closeSeason.mockResolvedValue({
      cropSeasonId: seasonId,
      status: CropSeasonStatus.CLOSED,
      source: 'SNAPSHOT',
      closedAt: '2026-08-31T00:00:00.000Z',
      totalCostInCents: 100000,
      areaHa: '10',
      harvestedQuantity: '0',
      productionUomId: 'uom-id',
      productionUomAcronym: 'kg',
      costPerHaInCents: 10000,
      costPerUnitInCents: null,
      referenceSalePriceInCents: 120,
      estimatedMarginPerUnitInCents: null,
      breakdownByCategory: [],
      breakdownBySource: [],
      byField: [],
    });

    const result = await service.execute(seasonId, farmId, userId);

    expect(closeSeason).toHaveBeenCalledWith({
      cropSeasonId: seasonId,
      farmId,
      closedByUserId: userId,
    });
    expect(result.costing.status).toBe('CLOSED');
    expect(result.costing.source).toBe('SNAPSHOT');
    expect(result.costing.costPerUnitInCents).toBeNull();
  });
});
