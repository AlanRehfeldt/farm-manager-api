import { BadRequestException } from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import { ExportCropSeasonCostingService } from './export-crop-season-costing.service';
import { GetCropSeasonCostingService } from './get-crop-season-costing.service';

describe('ExportCropSeasonCostingService', () => {
  const getCropSeasonCosting = jest.fn();
  const getCropSeasonCostingService = {
    execute: getCropSeasonCosting,
  } as unknown as jest.Mocked<GetCropSeasonCostingService>;

  const service = new ExportCropSeasonCostingService(
    getCropSeasonCostingService,
  );

  const farmId = 'farm-id';
  const seasonId = 'season-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws BadRequestException for unsupported format', async () => {
    await expect(
      service.execute(seasonId, farmId, 'pdf'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns csv content for format=csv', async () => {
    getCropSeasonCosting.mockResolvedValue({
      costing: {
        cropSeasonId: seasonId,
        status: CropSeasonStatus.ACTIVE,
        source: 'LIVE',
        closedAt: null,
        productionUomId: 'uom-id',
        productionUomAcronym: 'kg',
        totalCostInCents: 0,
        areaHa: '0',
        harvestedQuantity: '0',
        costPerHaInCents: null,
        costPerUnitInCents: null,
        referenceSalePriceInCents: null,
        estimatedMarginPerUnitInCents: null,
        breakdownByCategory: [],
        breakdownBySource: [],
        byField: [],
      },
    });

    const result = await service.execute(seasonId, farmId, 'csv');

    expect(result.contentType).toBe('text/csv; charset=utf-8');
    expect(result.filename).toBe(`custeio-safra-${seasonId}.csv`);
    expect(result.content).toContain('Relatório de custeio da safra');
    expect(getCropSeasonCosting).toHaveBeenCalledWith(seasonId, farmId);
  });
});
