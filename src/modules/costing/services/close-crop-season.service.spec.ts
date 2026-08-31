import { ConflictException, NotFoundException } from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
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
    costingRepository.findCostEntries.mockResolvedValue([
      {
        fieldId: 'field-1',
        sourceType: 'ACTIVITY_INPUT',
        costCategoryId: 'cat-1',
        costCategoryCode: 'outros',
        costCategoryName: 'Outros',
        amountInCents: 100000n,
      },
    ]);
    costingRepository.findPlantings.mockResolvedValue([
      {
        fieldId: 'field-1',
        fieldName: 'T1',
        areaHa: new Decimal(10),
      },
    ]);
    costingRepository.findFieldHarvests.mockResolvedValue([]);
    closeSeason.mockResolvedValue();

    const result = await service.execute(seasonId, farmId, userId);

    expect(closeSeason).toHaveBeenCalledWith(
      expect.objectContaining({
        cropSeasonId: seasonId,
        farmId,
        closedByUserId: userId,
      }),
    );
    expect(result.costing.status).toBe('CLOSED');
    expect(result.costing.source).toBe('SNAPSHOT');
    expect(result.costing.costPerUnitInCents).toBeNull();
  });
});
