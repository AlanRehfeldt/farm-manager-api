import { CropSeasonStatus, CostEntrySourceType } from '@prisma/client';
import {
  buildCostingExportFilename,
  formatSeasonCostingCsv,
} from './format-season-costing-csv';
import { SeasonCostingResponse } from '../mappers/costing.mapper';

function buildSampleCosting(): SeasonCostingResponse {
  return {
    cropSeasonId: 'season-123',
    status: CropSeasonStatus.ACTIVE,
    source: 'LIVE',
    closedAt: null,
    productionUomId: 'uom-kg',
    productionUomAcronym: 'kg',
    totalCostInCents: 44000000,
    areaHa: '40',
    harvestedQuantity: '800000',
    costPerHaInCents: 1100000,
    costPerUnitInCents: 55,
    referenceSalePriceInCents: 120,
    estimatedMarginPerUnitInCents: 65,
    breakdownByCategory: [
      {
        costCategoryId: 'cat-1',
        code: 'fertilizante',
        name: 'Fertilizante',
        amountInCents: 28000000,
      },
    ],
    breakdownBySource: [
      {
        sourceType: CostEntrySourceType.ACTIVITY_INPUT,
        amountInCents: 28000000,
      },
      {
        sourceType: CostEntrySourceType.ACTIVITY_LABOR,
        amountInCents: 16000000,
      },
    ],
    byField: [
      {
        fieldId: 'field-1',
        fieldName: 'T1',
        areaHa: '25',
        harvestedQuantity: '500000',
        totalCostInCents: 30000000,
        costPerHaInCents: 1200000,
        costPerUnitInCents: 60,
      },
    ],
  };
}

describe('formatSeasonCostingCsv', () => {
  it('includes summary totals and category breakdown', () => {
    const csv = formatSeasonCostingCsv(buildSampleCosting());

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('Relatório de custeio da safra');
    expect(csv).toContain('Custo total,440000.00,BRL');
    expect(csv).toContain('Breakdown por natureza');
    expect(csv).toContain('fertilizante,Fertilizante,280000.00');
    expect(csv).toContain('Breakdown por origem');
    expect(csv).toContain('Insumos,280000.00');
    expect(csv).toContain('Mão de obra,160000.00');
    expect(csv).toContain('Custeio por talhão');
    expect(csv).toContain('T1,25,500000,300000.00,12000.00,0.60');
    expect(csv).toContain('sem dados pessoais');
  });

  it('escapes commas in field names', () => {
    const costing = buildSampleCosting();
    costing.byField[0].fieldName = 'Talhão A, Norte';

    const csv = formatSeasonCostingCsv(costing);

    expect(csv).toContain('"Talhão A, Norte"');
  });
});

describe('buildCostingExportFilename', () => {
  it('builds a stable filename from crop season id', () => {
    expect(buildCostingExportFilename('season-123')).toBe(
      'custeio-safra-season-123.csv',
    );
  });
});
