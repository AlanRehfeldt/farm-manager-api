import { ConflictException, NotFoundException } from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import { UpdateReferencePriceService } from './update-reference-price.service';
import { CostingRepository } from '../repositories/costing.repository';

describe('UpdateReferencePriceService', () => {
  const updateReferencePrice = jest.fn<
    ReturnType<CostingRepository['updateReferencePrice']>,
    Parameters<CostingRepository['updateReferencePrice']>
  >();

  const costingRepository: jest.Mocked<CostingRepository> = {
    findSeasonContext: jest.fn(),
    findCostEntries: jest.fn(),
    findPlantings: jest.fn(),
    findFieldHarvests: jest.fn(),
    findSnapshot: jest.fn(),
    closeSeason: jest.fn(),
    updateReferencePrice,
  };

  const service = new UpdateReferencePriceService(costingRepository);

  const farmId = 'farm-id';
  const seasonId = 'season-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws NotFoundException when crop season does not exist', async () => {
    costingRepository.findSeasonContext.mockResolvedValue(null);

    await expect(
      service.execute(seasonId, farmId, 120n),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ConflictException when crop season is closed', async () => {
    costingRepository.findSeasonContext.mockResolvedValue({
      id: seasonId,
      farmId,
      status: CropSeasonStatus.CLOSED,
      productionUomId: 'uom-id',
      productionUomAcronym: 'kg',
      referenceSalePriceInCents: null,
    });

    await expect(
      service.execute(seasonId, farmId, 120n),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updates reference price and returns live costing', async () => {
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
    updateReferencePrice.mockResolvedValue();

    const result = await service.execute(seasonId, farmId, 120n);

    expect(updateReferencePrice).toHaveBeenCalledWith({
      cropSeasonId: seasonId,
      farmId,
      referenceSalePriceInCents: 120n,
    });
    expect(result.costing.referenceSalePriceInCents).toBe(120);
    expect(result.costing.source).toBe('LIVE');
  });
});
