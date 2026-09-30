# Farm Manager API — guia para agentes

Repositório NestJS da API REST do Farm Manager. Este arquivo é o índice rápido; detalhes em `docs/` e rules em `.cursor/rules/`.

## Stack

| Tecnologia | Versão / uso |
|------------|----------------|
| NestJS | 11 — monólito modular |
| Prisma | 7 — PostgreSQL (`prisma.config.ts` + `@prisma/adapter-pg`) |
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

O código **ainda não implementa** RBAC nomeado (ADR-013), outbox de eventos, soft delete ou exception filter global. **MVP M0–M4 (PR-01–PR-13)** e **feedback de uso / correções (PR-22, PR-24, PR-27–PR-42)** estão implementados. Tenancy (Organization, Farm, Membership, `@FarmScoped()`, `@FarmAdmin()`) em `docs/08-tenancy.md`. **`User.platformRole`** (`NONE` | `PLATFORM_ADMIN` | `PLATFORM_SUPPORT`) e `@PlatformAdmin()` existem (PR-05.1, ADR-018, ADR-020). **`/platform/*` (PR-18, PR-47–PR-51)** provisiona org + fazenda + ADMIN do cliente e reseta senha; o vendor não ganha `Membership`. A lista `GET /platform/organizations` lê colunas da organização (`lastAccessAt`, `lastActivityAt`, `_count` de fazendas) com filtros `status`, `usage` e `access` e `perPage` de 1 a 100. O detalhe `GET /platform/organizations/:organizationId` conta 30 dias só daquela org; `PATCH` atualiza o cadastro; `DELETE .../users/:userId` tira o vínculo e revoga o refresh daquela org. `GET /platform/adoption-summary` agrega a carteira pelas colunas e uma série semanal de atividades. **Suspensão (PR-20):** `Organization.status` (`ACTIVE` | `SUSPENDED`) e `PATCH /platform/organizations/:organizationId/status`; org suspensa não autentica nem acessa dados — detalhe em `docs/08-tenancy.md` e `docs/05-auth.md`. `POST /onboarding` só cria a primeira fazenda da org do token e recusa `PLATFORM_SUPPORT`. **Multi-org (PR-25):** access e refresh carregam `organizationSelection`; uma org ativa entra `BOUND`, duas ou mais ficam `PENDING` até `POST /auth/select-organization`. Recurso de outra org responde `FORBIDDEN_ORGANIZATION`. Suporte e platform admin ficam `EXEMPT`. `User.role` foi removido. Console vendor em `farm-manager-admin` (PR-19): organizações e usuários, guard `platformRole`. **`User.mustChangePassword`** e `POST /auth/change-password` (PR-22): contas criadas via `POST /users`, `POST /platform/organizations`, `POST /platform/users` ou `POST /memberships` (novo usuário) devem trocar senha antes de rotas de negócio. **Invalidação de sessão (PR-39 / ADR-021):** claim `passwordChangedAt` no access JWT — detalhe em `docs/05-auth.md`. **Gestão de usuários (PR-24, atomicidade PR-38):** `farmIds` em `POST /memberships`, `PATCH/DELETE /memberships/users/:userId`, listagem da org sem platform admins. **Cadastros estendidos (PR-27, limpeza PR-37):** campos de org/fazenda; fornecedor CPF **ou** CNPJ. **Compras (PR-28/PR-35):** parcelas com `manuallyAdjusted` e travamento de valor zero. **Rateio (PR-29/PR-34):** `CostEntry.farmId` (destino) pode diferir de `Transaction.farmId` (pagador) na mesma org. **MO CLT (PR-30–PR-33):** módulo `labor-closing` — `GET /labor-month-closings/preview`, `POST /labor-month-closings`, `PATCH /labor-month-closings/:id/reopen`; autorização **admin org-wide** (não membership pontual). **Financeiro/colheita (PR-12):** `POST/GET /expenses`, `POST/GET /harvests`. **Custeio (PR-13):** `GET /crop-seasons/:id/costing`, `PUT /crop-seasons/:id/reference-price`, `PATCH /crop-seasons/:id/close` + `SeasonCostingSnapshot`. **E2e:** `test/mvp-flows.e2e-spec.ts` (F3–F7); também `platform`, `organization-suspension`, `onboarding`, `suppliers`, `purchases-installments`, `expense-cross-farm`, `labor-month-closing`, `password-change`, `org-users`, `support-access`, `select-organization`.

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
