export type CostCategorySeedEntry = {
  code: string;
  name: string;
};

/** Taxonomia fechada do MVP (ADR-007). */
export const COST_CATEGORY_SEED: readonly CostCategorySeedEntry[] = [
  { code: 'fertilizante', name: 'Fertilizante' },
  { code: 'defensivo', name: 'Defensivo' },
  { code: 'muda', name: 'Muda' },
  { code: 'MO_fixa', name: 'Mão de obra fixa' },
  { code: 'MO_temporaria', name: 'Mão de obra temporária' },
  { code: 'combustivel', name: 'Combustível' },
  { code: 'energia_irrigacao', name: 'Energia / irrigação' },
  { code: 'servicos', name: 'Serviços' },
  { code: 'maquina', name: 'Máquina' },
  { code: 'formacao', name: 'Formação' },
  { code: 'outros', name: 'Outros' },
] as const;
