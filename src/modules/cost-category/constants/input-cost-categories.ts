import { COST_CATEGORY_SEED } from './cost-category-seed';

/** Códigos de natureza aplicáveis a insumos (produtos). */
export const INPUT_COST_CATEGORY_CODES = [
  'fertilizante',
  'defensivo',
  'muda',
  'combustivel',
  'energia_irrigacao',
  'servicos',
  'formacao',
  'outros',
] as const;

export type InputCostCategoryCode = (typeof INPUT_COST_CATEGORY_CODES)[number];

const inputCodeSet = new Set<string>(INPUT_COST_CATEGORY_CODES);

export function isInputCostCategoryCode(
  code: string,
): code is InputCostCategoryCode {
  return inputCodeSet.has(code);
}

/** Valida que o código pertence à taxonomia de insumo (não MO/máquina). */
export function assertInputCostCategoryCode(code: string): void {
  if (!isInputCostCategoryCode(code)) {
    throw new Error(`Invalid input cost category code: ${code}`);
  }
}

export const ALL_COST_CATEGORY_CODES = COST_CATEGORY_SEED.map(
  (entry) => entry.code,
);
