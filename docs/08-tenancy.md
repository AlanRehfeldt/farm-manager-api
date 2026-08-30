# Tenancy (Organization + Farm)

**Status:** Implementado (PR-03, PR-05). Decisão de produto: `farm-manager-docs/04-tecnico/adr/005-organization-farm-tenancy.md`.

## Modelo

- **Organization** — agrupador de fazendas e catálogos.
- **Farm** — unidade operacional (header `x-farm-id`). Unique `(organizationId, name)`.
- **Membership** — `ADMIN` | `USER`. `farmId` null = todas as fazendas da org; preenchido = só aquela.

`User.role` permanece (legado). Autorização de fazenda = Membership. ACL nomeada (ADR-013) **não** está neste PR.

## Contexto HTTP

Rotas de catálogo e lançamentos usam `@FarmScoped()` (`FarmMembershipGuard`, **não** global).

| Situação | HTTP |
|----------|------|
| Sem `x-farm-id` | 400 |
| Farm inexistente ou sem membership (pontual ou org-wide) | 403 |
| Get-by-id de outro tenant / cadastro restrito à outra farm | 404 |

`organizationId` **nunca** entra no body — vem de `@OrganizationId()`, derivado da farm do header.

Decorators: `@FarmId()`, `@OrganizationId()` em `src/common/tenancy/`.

## Três camadas de escopo

| Camada | Entidades | Persistência | Listagem |
|--------|-----------|--------------|----------|
| Sempre org | `UnitOfMeasurement`, `CostCenter`, `AccountPlan` | `organizationId` obrigatório, sem `farmId` | só `organizationId` |
| Org + visibilidade | `Product`, `Supplier`, `Employee` | `organizationId` + `farmId` opcional | org **e** (`farmId` IS NULL OR `farmId` = farm ativa) |
| Sempre farm | `Transaction`, `StockMovement`, `ProductStockBalance` | `farmId` obrigatório | `farmId` do header |

Installment / Purchase / Salary isolados via `transaction.farmId`.

Identidade de catálogo é da **org**: `(organizationId, acronym)`, `(organizationId, code)`, `(organizationId, cnpj)`, `(organizationId, registration)`. Saldo de estoque é `(farmId, productId)`.

No create de Product/Supplier/Employee, omitir `farmId` = compartilhado; se enviado, tem de igualar `x-farm-id`.

## Módulos de tenancy

| Recurso | Auth extra |
|---------|------------|
| `POST /onboarding` | autenticado sem membership; cria org + primeira farm + ADMIN org-wide |
| `POST /organizations` | usuário autenticado torna-se ADMIN org-wide |
| `POST /farms` | ADMIN da org (service) |
| `POST /memberships` | ADMIN; `userId` existente **ou** name/email/password |
| `GET /memberships` | ADMIN; inclui `user` (id, name, email) |
| `GET /auth/me` | inclui `memberships` |

`POST /users` continua `@Public()` para o primeiro usuário.

## Bootstrap

Fluxo piloto (app PR-05):

`POST /users` → login → `POST /onboarding` (org + primeira farm) → home com `GET /farms` e `x-farm-id` em catálogo/transações.

Alternativa manual (ainda válida): `POST /organizations` → `POST /farms`.

Settings no app: `GET/PATCH /organizations/:id`, `GET/POST/PATCH /farms`, `GET/POST/DELETE /memberships` (ADMIN).

## Fora deste recorte

Field/Crop/Season/Machine (PR-06), permissões nomeadas (ADR-013), join table cadastro × N fazendas.
