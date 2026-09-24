import z from 'zod';

export const BR_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

export type BrState = (typeof BR_STATES)[number];

export const brStateSchema = z.enum(BR_STATES, {
  message: 'State must be a valid Brazilian UF.',
});

export const optionalNullableBrStateSchema = brStateSchema
  .nullable()
  .optional();
