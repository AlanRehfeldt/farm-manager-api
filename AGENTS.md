# Farm Manager API — guia para agentes

Repositório NestJS da API REST do Farm Manager. Este arquivo é o índice rápido; detalhes em `docs/` e rules em `.cursor/rules/`.

## Stack

| Tecnologia | Versão / uso |
|------------|----------------|
| NestJS | 11 — monólito modular |
| Prisma | 6 — PostgreSQL |
| Zod | 4 — validação runtime (controllers, env) |
| Auth | JWT em cookies httpOnly (`fm_access_token`, `fm_refresh_token`) |
| OpenAPI | `@nestjs/swagger` + Scalar em `/docs` |

## Onde está cada coisa

| Recurso | Caminho |
|---------|---------|
| Documentação de engenharia | [`docs/README.md`](./docs/README.md) |
| Rules do Cursor | `.cursor/rules/*.mdc` |
| Módulos de feature | `src/modules/` |
| Prisma | `prisma/schema.prisma`, `prisma/migrations/` |
| Pipe de validação | `src/common/pipes/zod-validation-pipe.ts` |
| DTOs de erro (Swagger) | `src/common/errors/` |
| Env tipado | `src/env.ts` |

## Domínio e produto (outro repositório)

Regras de negócio, bounded contexts, ADRs, catálogo de códigos de erro de domínio e roadmap de implementação estão em **`farm-manager-docs`** — não duplicar aqui.

Referências úteis:

- Arquitetura e fronteiras: `farm-manager-docs/04-tecnico/04-architecture-overview.md`, `03-api-boundaries.md`
- Contrato de módulos: `farm-manager-docs/07-plataforma/01-module-contract.md`
- ADRs: `farm-manager-docs/04-tecnico/adr/00-indice.md`

## Convenções obrigatórias (código novo)

1. **Slice vertical**: um controller + um service por ação; service expõe `execute()`.
2. **Validação**: Zod 4 + `ZodValidationPipe`. Não usar `class-validator` (não é usado no projeto).
3. **Resposta comando/get**: `{ statusCode, message, result }`. Listagem: `{ results, total, page, perPage, orderBy, orderDirection }`.
4. **Repositório**: interface + token `ENTITY_REPOSITORY` + `PrismaXRepository`.
5. **Auth**: guard global; `@Public()` só em rotas explicitamente abertas.
6. **Imports**: alias `src/...`.
7. **Erros**: exceções Nest nos services; controllers não engolem erro com `console.error`.

## Estado atual vs. ADRs (não inventar)

O código **ainda não implementa** RBAC nomeado (ADR-013), outbox de eventos, CostEntry ledger, soft delete ou exception filter global. Tenancy (Organization, Farm, Membership, `@FarmScoped()`) está em `docs/08-tenancy.md`. **`User.platformRole`** (`NONE` | `PLATFORM_ADMIN`) e `@PlatformAdmin()` existem (PR-05.1, ADR-018); namespace `/platform/*` e console vendor ainda não. **Estrutura agrícola** (PR-06): `Field`, `Crop`, `Variety`, `Machine`, `CropSeason`, `CropPlanting`; `PATCH /crop-seasons/:id/activate`; close em stub 501 até PR-13.

## Rules do Cursor

| Rule | Quando |
|------|--------|
| `project.mdc` | Sempre |
| `nest-modules.mdc` | `src/modules/**` |
| `validation-zod.mdc` | controllers, pipes, `env.ts` |
| `http-conventions.mdc` | controllers, DTOs |
| `errors.mdc` | services, controllers, `common/errors` |
| `prisma.mdc` | `prisma/**`, repositories |
| `auth.mdc` | `src/modules/auth/**` |
| `tenancy.mdc` | tenancy e módulos com `x-farm-id` |
| `testing.mdc` | `*.spec.ts`, `test/**` |

A skill comunitária `nestjs-best-practices` pode recomendar `class-validator`; **ignorar** — este projeto usa Zod.
