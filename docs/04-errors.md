# Erros HTTP

## Visão geral

Não há exception filter global customizado. Erros são:

1. **Validação Zod** — `ZodValidationPipe` → `BadRequestException` estruturado.
2. **Exceções Nest** nos services — formato padrão do Nest.
3. **DTOs em `src/common/errors/`** — apenas para documentação Swagger.

Códigos de erro de **domínio** (`INSUFFICIENT_STOCK`, `SEASON_CLOSED`, etc.) estão propostos em `farm-manager-docs/04-tecnico/03-api-boundaries.md` — ainda **não** implementados como `code` no JSON de resposta.

## Validação — 400 Bad Request

`src/common/pipes/zod-validation-pipe.ts`:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "unitOfMeasurementId", "message": "Invalid UUID" }
  ]
}
```

- `field`: path do issue Zod unido por `.` (ex.: `address.city`).
- Swagger: `BadRequestDto` em `src/common/errors/bad-request.dto.ts`.

## Exceções Nest nos services

| Exceção | HTTP | Uso típico |
|---------|------|------------|
| `BadRequestException` | 400 | Regra de negócio inválida |
| `UnauthorizedException` | 401 | Credenciais inválidas (auth) |
| `NotFoundException` | 404 | Recurso não encontrado |
| `ConflictException` | 409 | Duplicidade (email, CNPJ) |

Exemplo de resposta Nest (404):

```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}
```

O campo `error` vem do Nest — não está nos DTOs Swagger de erro.

## DTOs de erro (OpenAPI)

| Arquivo | Uso em `@Api*Response` |
|---------|------------------------|
| `bad-request.dto.ts` | 400 validação |
| `unauthorized.dto.ts` | 401 |
| `forbidden.dto.ts` | 403 (definido, pouco usado) |
| `not-found.dto.ts` | 404 |
| `conflict.dto.ts` | 409 |

Controllers referenciam esses tipos em `@ApiBadRequestResponse({ type: BadRequestDto })`, etc.

## O que evitar em código novo

```typescript
// ❌ Drift legado
try {
  await this.service.execute(data);
} catch (error) {
  console.error('Error creating product', error);
  throw error;
}

// ✅ Delegar ao Nest
const { product } = await this.createProductService.execute(data);
return { statusCode, message, result: product };
```

## Futuro — erros de domínio

Quando implementado (filter + envelope), respostas podem incluir `code` alinhado ao catálogo em `farm-manager-docs`. Até então, não adicionar `code` ad hoc.

## Referências

- `farm-manager-docs/04-tecnico/03-api-boundaries.md` — catálogo de códigos propostos
- [03-http.md](./03-http.md) — envelopes de sucesso
