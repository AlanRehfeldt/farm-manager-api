import { CostEntrySourceType } from '@prisma/client';
import { SeasonCostingResponse } from '../mappers/costing.mapper';

const SOURCE_TYPE_LABELS: Record<CostEntrySourceType, string> = {
  ACTIVITY_INPUT: 'Insumos',
  ACTIVITY_LABOR: 'Mão de obra',
  ACTIVITY_MACHINE: 'Máquina',
  ALLOCATION: 'Rateios',
  REVERSAL: 'Estornos',
};

const STATUS_LABELS: Record<string, string> = {
  PLANNED: 'Planejada',
  ACTIVE: 'Em andamento',
  CLOSED: 'Fechada',
};

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function csvRow(fields: string[]): string {
  return `${fields.map(escapeCsvField).join(',')}\n`;
}

function formatBrl(cents: number | null): string {
  if (cents == null) {
    return '';
  }

  return (cents / 100).toFixed(2);
}

export function formatSeasonCostingCsv(costing: SeasonCostingResponse): string {
  const lines: string[] = [];

  lines.push(csvRow(['Relatório de custeio da safra']));
  lines.push(
    csvRow([
      'ID da safra',
      costing.cropSeasonId,
      'Status',
      STATUS_LABELS[costing.status] ?? costing.status,
      'Fonte',
      costing.source === 'SNAPSHOT' ? 'Snapshot' : 'Parcial (ao vivo)',
    ]),
  );

  if (costing.closedAt) {
    lines.push(
      csvRow([
        'Fechada em',
        new Date(costing.closedAt).toISOString().slice(0, 10),
      ]),
    );
  }

  lines.push('');
  lines.push(csvRow(['Resumo']));
  lines.push(csvRow(['Métrica', 'Valor', 'Unidade']));
  lines.push(
    csvRow(['Custo total', formatBrl(costing.totalCostInCents), 'BRL']),
  );
  lines.push(csvRow(['Área total', costing.areaHa, 'ha']));
  lines.push(
    csvRow([
      'Volume colhido',
      costing.harvestedQuantity,
      costing.productionUomAcronym,
    ]),
  );
  lines.push(
    csvRow([
      'Custo por hectare',
      formatBrl(costing.costPerHaInCents),
      'BRL/ha',
    ]),
  );
  lines.push(
    csvRow([
      `Custo por ${costing.productionUomAcronym}`,
      formatBrl(costing.costPerUnitInCents),
      `BRL/${costing.productionUomAcronym}`,
    ]),
  );
  lines.push(
    csvRow([
      'Preço de referência',
      formatBrl(costing.referenceSalePriceInCents),
      `BRL/${costing.productionUomAcronym}`,
    ]),
  );
  lines.push(
    csvRow([
      `Margem estimada por ${costing.productionUomAcronym}`,
      formatBrl(costing.estimatedMarginPerUnitInCents),
      `BRL/${costing.productionUomAcronym}`,
    ]),
  );

  lines.push('');
  lines.push(csvRow(['Breakdown por natureza']));
  lines.push(csvRow(['Código', 'Natureza', 'Valor (BRL)']));
  for (const category of costing.breakdownByCategory) {
    lines.push(
      csvRow([category.code, category.name, formatBrl(category.amountInCents)]),
    );
  }

  lines.push('');
  lines.push(csvRow(['Breakdown por origem']));
  lines.push(csvRow(['Origem', 'Valor (BRL)']));
  for (const source of costing.breakdownBySource) {
    lines.push(
      csvRow([
        SOURCE_TYPE_LABELS[source.sourceType] ?? source.sourceType,
        formatBrl(source.amountInCents),
      ]),
    );
  }

  lines.push('');
  lines.push(csvRow(['Custeio por talhão']));
  lines.push(
    csvRow([
      'Talhão',
      'Área (ha)',
      `Colhido (${costing.productionUomAcronym})`,
      'Custo total (BRL)',
      'Custo/ha (BRL)',
      `Custo/${costing.productionUomAcronym} (BRL)`,
    ]),
  );
  for (const field of costing.byField) {
    lines.push(
      csvRow([
        field.fieldName,
        field.areaHa,
        field.harvestedQuantity,
        formatBrl(field.totalCostInCents),
        formatBrl(field.costPerHaInCents),
        formatBrl(field.costPerUnitInCents),
      ]),
    );
  }

  lines.push('');
  lines.push(
    csvRow([
      'Nota',
      'Relatório agregado sem dados pessoais ou detalhamento de salários.',
    ]),
  );

  return `\uFEFF${lines.join('')}`;
}

export function buildCostingExportFilename(cropSeasonId: string): string {
  return `custeio-safra-${cropSeasonId}.csv`;
}
