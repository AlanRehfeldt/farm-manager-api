# HTTP — rotas e envelopes

## Rotas

- **Sem prefixo global** — endpoints na raiz (`/products`, não `/api/products`).
- **Plural**, kebab-case: `/cost-centers`, `/unit-of-measurements`, `/account-plans`.
- Auth: `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`.
- Tenancy: `/organizations`, `/farms`, `/memberships`. Rotas de catálogo e lançamentos exigem header `x-farm-id` — ver [08-tenancy.md](./08-tenancy.md).

Padrão CRUD por recurso:

| Método | Path | Ação |
|--------|------|------|
| `POST` | `/resources` | create |
| `GET` | `/resources` | fetch (lista) |
| `GET` | `/resources/:id` | get |
| `PUT` | `/resources/:id` | update |
| `DELETE` | `/resources/:id` | delete |

## Envelope — comando, get e update (padrão alvo)

Código **novo** deve usar:

```json
{
  "statusCode": 201,
  "message": "Product created successfully",
  "result": { "id": "...", "name": "..." }
}
```

- `statusCode`: número HTTP (usar `HttpStatus` no controller).
- `message`: string descritiva em inglês.
- `result`: payload da entidade ou `null` no delete.

Auth (login, refresh, logout) segue o mesmo padrão quando aplicável.

## Envelope — listagem (fetch)

Sem `statusCode` nem `message`:

```json
{
  "results": [ /* ... */ ],
  "total": 42,
  "page": 1,
  "perPage": 10,
  "orderBy": "name",
  "orderDirection": "asc"
}
```

Query params comuns (validados via Zod):

| Param | Default | Descrição |
|-------|---------|-----------|
| `page` | `1` | Página |
| `perPage` | `10` | Tamanho |
| `orderBy` | campo do modelo | Ordenação |
| `orderDirection` | `asc` | `asc` / `desc` |
| Filtros | — | Específicos do recurso |

## Drift conhecido (não copiar)

Alguns controllers de User ainda usam try/catch + `console.error`. Código novo deve delegar exceções ao Nest e usar envelope `result`.

Ao tocar um controller legado, preferir migrar ao envelope `result` na mesma PR.

## Swagger e Scalar

Configurado em `src/main.ts`:

| URL | Ferramenta |
|-----|------------|
| `/swagger` | Swagger UI (`@nestjs/swagger`) |
| `/docs` | Scalar API Reference (`@scalar/nestjs-api-reference`) |

- OpenAPI gerado a partir de decorators e DTOs com `@ApiProperty`.
- Schemas Zod **não** aparecem automaticamente no OpenAPI — DTOs Swagger são a fonte do spec.
- Auth documentada como cookies httpOnly na descrição do documento; não usar `@ApiBearerAuth` como padrão.

## CORS e cookies

Frontend deve chamar com `credentials: 'include'`. API usa `CORS_ORIGIN` e `credentials: true`. Ver [05-auth.md](./05-auth.md).

## Referências

- [04-errors.md](./04-errors.md)
- Rotas futuras por contexto: `farm-manager-docs/04-tecnico/03-api-boundaries.md`
