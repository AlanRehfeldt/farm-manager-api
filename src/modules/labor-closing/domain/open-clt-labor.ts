import { Prisma, PrismaClient } from '@prisma/client';

type LaborReader = Prisma.TransactionClient | PrismaClient;

export type OpenCltLaborMonth = {
  year: number;
  month: number;
};

/**
 * Hora CLT aberta é a natureza da linha (colaborador, sem tarifa, sem custo),
 * não o regime atual do cadastro. Trocar para CONTRACTOR não esconde a hora.
 */
export function openCltLaborWhere(
  cropSeasonId: string,
): Prisma.ActivityLaborWhereInput {
  return {
    costInCents: null,
    hourlyRateInCents: null,
    employeeId: { not: null },
    hours: { not: null },
    activity: { cropSeasonId, reversedAt: null },
  };
}

export function formatOpenCltLaborMonths(months: OpenCltLaborMonth[]): string {
  return months
    .map((month) => `${String(month.month).padStart(2, '0')}/${month.year}`)
    .join(', ');
}

export async function findOpenCltLaborMonths(
  db: LaborReader,
  cropSeasonId: string,
): Promise<OpenCltLaborMonth[]> {
  const rows = await db.activityLabor.findMany({
    where: openCltLaborWhere(cropSeasonId),
    select: {
      activity: {
        select: {
          date: true,
        },
      },
    },
  });

  const seen = new Set<string>();
  const result: OpenCltLaborMonth[] = [];

  for (const row of rows) {
    const year = row.activity.date.getUTCFullYear();
    const month = row.activity.date.getUTCMonth() + 1;
    const key = `${year}-${month}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ year, month });
    }
  }

  return result.sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month,
  );
}
