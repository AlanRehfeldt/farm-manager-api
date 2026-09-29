import z from 'zod';

/**
 * Aceita o schema, `null` ou `""`. String vazia (ou só espaços) vira `null`
 * antes da validação, para a mensagem do campo continuar a do schema.
 * `undefined` continua significando “não enviado”.
 */
export function emptyToNull<T extends z.ZodType>(schema: T) {
  return z.preprocess(
    (value) =>
      typeof value === 'string' && value.trim() === '' ? null : value,
    schema.nullable().optional(),
  );
}
