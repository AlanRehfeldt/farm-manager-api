import { CostEntrySourceType } from '@prisma/client';

type CostEntryReversalFields = {
  sourceType: CostEntrySourceType;
  reversedAt: Date | null;
};

/**
 * Atividade totalmente estornada = todos os CostEntry originais têm reversedAt.
 * Horas CLT ainda abertas (sem CostEntry) não contam como estorno.
 */
export function isActivityFullyReversed(
  costEntries: CostEntryReversalFields[],
): boolean {
  const original = costEntries.filter(
    (entry) => entry.sourceType !== CostEntrySourceType.REVERSAL,
  );

  return (
    original.length > 0 && original.every((entry) => entry.reversedAt != null)
  );
}
