# Arquitetura

**Status:** Fato (código atual) + referências a decisões em `farm-manager-docs`.

## Visão geral

Monólito modular NestJS 11, uma instância, PostgreSQL via Prisma 6. SPA React consome a API REST com cookies httpOnly para auth.

```mermaid
flowchart TB
  subgraph client [Cliente]
    SPA[React SPA]
  end
  subgraph api [farm-manager-api]
    C[Controllers]
    S[Services / use cases]
    R[Repository ports]
    P[PrismaService]
  end
  DB[(PostgreSQL)]
  SPA -->|HTTP + cookies| C
  C --> S
  S --> R
  R --> P
  P --> DB
```

## Camadas no código

| Camada | Responsabilidade | Onde |
|--------|------------------|------|
| Controller | HTTP, validação Zod, Swagger, envelope de resposta | `controllers/` |
| Service | Use case, regras, exceções de negócio | `services/` |
| Repository (port) | Interface + token DI | `repositories/*.repository.ts` |
| Prisma repository | Implementação Prisma | `repositories/prisma-*.repository.ts` |
| DTO Swagger | Documentação OpenAPI | `dtos/` |

Fluxo: **Controller → Service (`execute`) → Repository → Prisma**.

Não há camada `domain/` explícita nem use-case classes separadas — o service é o use case.

## Módulos registrados hoje

Em `src/app.module.ts`:

| Módulo | Contexto aproximado |
|--------|---------------------|
| `AuthModule` | Identity — login, refresh, logout, me |
| `UserModule` | Identity |
| `EmployeeModule` | People |
| `SupplierModule` | Catalog |
| `ProductModule` | Catalog |
| `UnitOfMeasurementModule` | Catalog |
| `CostCenterModule` | Finance |
| `AccountPlanModule` | Finance |
| `TransactionModule` | Finance |
| `InstallmentModule` | Finance |

`src/common/`: `PrismaModule`, `ZodValidationPipe`, DTOs de erro para Swagger.

## Alinhamento com bounded contexts

O mapa alvo de contextos e fronteiras está em `farm-manager-docs/04-tecnico/03-api-boundaries.md`. Os módulos Nest atuais são um **subconjunto** do catálogo — sem Season, Inventory, Operations, Harvest, Costing, Tenancy explícitos ainda.

## Implementado vs. planejado (ADRs)

| Capacidade | No código hoje | Planejado (docs/ADRs) |
|------------|----------------|-------------------------|
| Auth JWT cookie | Sim | — |
| Role enum em `User` | Sim (sem guard) | ADR-013 permissions |
| Tenancy por farm/org | Não | ADR-005, `@FarmId()` no roadmap |
| CostEntry ledger | Não | ADR-006, ADR-007 |
| Inventory desacoplado | Não | ADR-012 |
| Domain event outbox | Não | ADR-015 |
| Ports entre módulos | Parcial (token de repo exportado) | ADR-016 — ports formais |
| Soft delete | Não | — |
| Exception filter global | Não | Erros de domínio estruturados |
| Boundary lint (imports) | Não | `04-architecture-overview.md` |

**Não implementar** tenancy, RBAC ou outbox em código novo sem PR/ADR explícito — documentar drift se necessário.

## Infra transversal

| Item | Estado |
|------|--------|
| `ConfigModule` + Zod env | Global |
| `ValidationPipe` global | Registrado em `main.ts`, **não usado** para validação |
| Interceptors | Nenhum |
| Middleware | `cookie-parser` |
| Logging | Sem `Logger` estruturado — drift com `console.error` em controllers |
| Prefixo `/api` | Não |
| CORS | `credentials: true`, origem via `CORS_ORIGIN` |

## Referências

- [02-module-anatomy.md](./02-module-anatomy.md)
- `farm-manager-docs/04-tecnico/04-architecture-overview.md`
- `farm-manager-docs/04-tecnico/adr/016-module-contract.md`
