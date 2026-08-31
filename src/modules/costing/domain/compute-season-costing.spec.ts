import { CostEntrySourceType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { computeSeasonCosting } from './compute-season-costing';

describe('computeSeasonCosting', () => {
  const plantings = [
    {
      fieldId: 'field-1',
      fieldName: 'T1',
      areaHa: new Decimal(25),
    },
    {
      fieldId: 'field-2',
      fieldName: 'T2',
      areaHa: new Decimal(15),
    },
  ];

  it('computes mango example: 40 ha, R$ 440k, 800k kg, margin R$ 0.65/kg', () => {
    const result = computeSeasonCosting({
      costEntries: [
        {
          fieldId: 'field-1',
          sourceType: CostEntrySourceType.ACTIVITY_INPUT,
          costCategoryId: 'cat-fert',
          costCategoryCode: 'fertilizante',
          costCategoryName: 'Fertilizante',
          amountInCents: 28000000n,
        },
        {
          fieldId: 'field-1',
          sourceType: CostEntrySourceType.ACTIVITY_LABOR,
          costCategoryId: 'cat-mo',
          costCategoryCode: 'MO_fixa',
          costCategoryName: 'Mão de obra fixa',
          amountInCents: 12000000n,
        },
        {
          fieldId: null,
          sourceType: CostEntrySourceType.ALLOCATION,
          costCategoryId: 'cat-serv',
          costCategoryCode: 'servicos',
          costCategoryName: 'Serviços',
          amountInCents: 4000000n,
        },
      ],
      plantings,
      fieldHarvests: [
        { fieldId: 'field-1', quantity: new Decimal(500000) },
        { fieldId: 'field-2', quantity: new Decimal(300000) },
      ],
      referenceSalePriceInCents: 120n,
    });

    expect(result.totalCostInCents).toBe(44000000);
    expect(result.areaHa).toBe('40');
    expect(result.harvestedQuantity).toBe('800000');
    expect(result.costPerHaInCents).toBe(1100000);
    expect(result.costPerUnitInCents).toBe(55);
    expect(result.referenceSalePriceInCents).toBe(120);
    expect(result.estimatedMarginPerUnitInCents).toBe(65);
    expect(result.breakdownByCategory).toHaveLength(3);
    expect(result.breakdownBySource).toHaveLength(3);
  });

  it('returns null costPerUnit when harvest is zero', () => {
    const result = computeSeasonCosting({
      costEntries: [
        {
          fieldId: 'field-1',
          sourceType: CostEntrySourceType.ACTIVITY_INPUT,
          costCategoryId: 'cat-1',
          costCategoryCode: 'outros',
          costCategoryName: 'Outros',
          amountInCents: 100000n,
        },
      ],
      plantings,
      fieldHarvests: [],
      referenceSalePriceInCents: null,
    });

    expect(result.costPerHaInCents).toBe(2500);
    expect(result.costPerUnitInCents).toBeNull();
    expect(result.estimatedMarginPerUnitInCents).toBeNull();
  });

  it('returns null costPerHa when area is zero', () => {
    const result = computeSeasonCosting({
      costEntries: [
        {
          fieldId: null,
          sourceType: CostEntrySourceType.ALLOCATION,
          costCategoryId: 'cat-1',
          costCategoryCode: 'servicos',
          costCategoryName: 'Serviços',
          amountInCents: 50000n,
        },
      ],
      plantings: [],
      fieldHarvests: [{ fieldId: 'field-1', quantity: new Decimal(1000) }],
      referenceSalePriceInCents: 100n,
    });

    expect(result.costPerHaInCents).toBeNull();
    expect(result.costPerUnitInCents).toBe(50);
  });

  it('computes per-field costing with allocated entries', () => {
    const result = computeSeasonCosting({
      costEntries: [
        {
          fieldId: 'field-1',
          sourceType: CostEntrySourceType.ACTIVITY_INPUT,
          costCategoryId: 'cat-1',
          costCategoryCode: 'fertilizante',
          costCategoryName: 'Fertilizante',
          amountInCents: 200000n,
        },
        {
          fieldId: 'field-2',
          sourceType: CostEntrySourceType.ACTIVITY_INPUT,
          costCategoryId: 'cat-1',
          costCategoryCode: 'fertilizante',
          costCategoryName: 'Fertilizante',
          amountInCents: 100000n,
        },
      ],
      plantings,
      fieldHarvests: [
        { fieldId: 'field-1', quantity: new Decimal(500) },
        { fieldId: 'field-2', quantity: new Decimal(300) },
      ],
      referenceSalePriceInCents: null,
    });

    expect(result.byField).toHaveLength(2);
    const t1 = result.byField.find((f) => f.fieldId === 'field-1');
    expect(t1?.totalCostInCents).toBe(200000);
    expect(t1?.costPerHaInCents).toBe(8000);
    expect(t1?.costPerUnitInCents).toBe(400);
  });
});
