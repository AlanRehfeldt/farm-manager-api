import { ConflictException, NotFoundException } from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import { CostingRepository } from '../repositories/costing.repository';
import { GetCropSeasonCostingService } from './get-crop-season-costing.service';
import { ReopenCropSeasonService } from './reopen-crop-season.service';

describe('ReopenCropSeasonService', () => {
  const reopenSeason = jest.fn<
    ReturnType<CostingRepository['reopenSeason']>,
    Parameters<CostingRepository['reopenSeason']>
  >();

  const costingRepository: jest.Mocked<CostingRepository> = {
    findSeasonContext: jest.fn(),
    findCostEntries: jest.fn(),
    findPlantings: jest.fn(),
    findFieldHarvests: jest.fn(),
    findSnapshot: jest.fn(),
    closeSeason: jest.fn(),
    reopenSeason,
    updateReferencePrice: jest.fn(),
  };

  const getCropSeasonCosting = jest.fn();
  const getCropSeasonCostingService = {
    execute: getCropSeasonCosting,
  } as unknown as jest.Mocked<GetCropSeasonCostingService>;

  const service = new ReopenCropSeasonService(
    costingRepository,
    getCropSeasonCostingService,
  );

  const farmId = 'farm-id';
  const seasonId = 'season-id';
  const userId = 'user-id';
  const reason = 'Lançamento esquecido';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws NotFoundException when crop season does not exist', async () => {
    costingRepository.findSeasonContext.mockResolvedValue(null);

    await expect(
      service.execute(seasonId, farmId, reason, userId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ConflictException when crop season is already active', async () => {
    costingRepository.findSeasonContext.mockResolvedValue({
      id: seasonId,
      farmId,
      status: CropSeasonStatus.ACTIVE,
      productionUomId: 'uom-id',
      productionUomAcronym: 'kg',
      referenceSalePriceInCents: null,
    });

    await expect(
      service.execute(seasonId, farmId, reason, userId),
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
      service.execute(seasonId, farmId, reason, userId),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('INV-REOPEN: invalidates snapshot and returns live costing', async () => {
    costingRepository.findSeasonContext.mockResolvedValue({
      id: seasonId,
      farmId,
      status: CropSeasonStatus.CLOSED,
      productionUomId: 'uom-id',
      productionUomAcronym: 'kg',
      referenceSalePriceInCents: 120n,
    });
    reopenSeason.mockResolvedValue(undefined);
    getCropSeasonCosting.mockResolvedValue({
      costing: {
        cropSeasonId: seasonId,
        status: CropSeasonStatus.ACTIVE,
        source: 'LIVE',
        closedAt: null,
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
      },
    });

    const result = await service.execute(seasonId, farmId, reason, userId);

    expect(reopenSeason).toHaveBeenCalledWith({
      cropSeasonId: seasonId,
      farmId,
      reason,
      reopenedByUserId: userId,
    });
    expect(getCropSeasonCosting).toHaveBeenCalledWith(seasonId, farmId);
    expect(result.costing.status).toBe('ACTIVE');
    expect(result.costing.source).toBe('LIVE');
    expect(result.costing.closedAt).toBeNull();
  });
});
