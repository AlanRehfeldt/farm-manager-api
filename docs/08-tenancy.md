# Tenancy (Organization + Farm)

**Status:** Implementado (PR-03, PR-05). Decisão de produto: `farm-manager-docs/04-tecnico/adr/005-organization-farm-tenancy.md`.

## Modelo

- **Organization** — agrupador de fazendas e catálogos.
- **Farm** — unidade operacional (header `x-farm-id`). Unique `(organizationId, name)`.
- **Membership** — `ADMIN` | `USER`. `farmId` null = todas as fazendas da org; preenchido = só aquela. Várias linhas pontuais por `(user, org)` (PR-24); **não** misturar org-wide com pontual. Índices únicos parciais no Postgres.

`User.role` permanece (legado). Autorização de fazenda = Membership (`ADMIN` | `USER`). **`User.platformRole`** (`NONE` | `PLATFORM_ADMIN`) é ortogonal ao tenant — ADR-018 em `farm-manager-docs`. ACL nomeada (ADR-013) **não** implementada; mutações sensíveis usam `@FarmAdmin()` (membership `ADMIN` org-wide ou na farm do header).

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
| Sempre org | `UnitOfMeasurement`, `CostCenter`, `AccountPlan`, `Crop` | `organizationId` obrigatório, sem `farmId` | só `organizationId` |
| Org + visibilidade | `Product`, `Supplier`, `Employee` | `organizationId` + `farmId` opcional | org **e** (`farmId` IS NULL OR `farmId` = farm ativa) |
| Sempre farm | `Transaction`, `StockMovement`, `ProductStockBalance`, `Field`, `Machine`, `CropSeason` | `farmId` obrigatório | `farmId` do header |
| Farm via season | `CropPlanting` | via `cropSeason.farmId` | farm da safra no header |
| Destino de alocação | `TransactionAllocation`, `CostEntry` (path B) | `farmId` destino (pode ≠ pagadora; mesma org) | ledger/custeio pela fazenda da safra |

Installment / Purchase / Salary isolados via `transaction.farmId`.

**Alocação de despesa (PR-29):** `Transaction.farmId` = fazenda **pagadora** (sempre o `x-farm-id` do header; **não** aceitar `farmId` no body da Transaction). `TransactionAllocation.farmId` = fazenda **destino** do custeio — pode diferir da pagadora, desde que seja da mesma organização e acessível ao usuário (`findAccessibleByUser`). `CostEntry.farmId` segue o destino da alocação (ledger do objeto de custo).

Identidade de catálogo é da **org**: `(organizationId, acronym)`, `(organizationId, code)`, `(organizationId, cnpj)`, `(organizationId, registration)`. Saldo de estoque é `(farmId, productId)`.

No create de Product/Supplier/Employee, omitir `farmId` = compartilhado; se enviado, tem de igualar `x-farm-id`.

## Módulos de tenancy

| Recurso | Auth extra |
|---------|------------|
| `POST /onboarding` | autenticado sem membership; cria org + primeira farm + ADMIN org-wide |
| `POST /organizations` | usuário autenticado torna-se ADMIN org-wide |
| `POST /farms` | ADMIN da org (service) |
| `POST /memberships` | ADMIN org-wide; `farmIds[]` (vazio = org-wide) ou `farmId` legado; `userId` existente **ou** name/email/password; criação de usuário + memberships é atômica |
| `PATCH /memberships/users/:userId` | ADMIN org-wide; nome, e-mail, papel, `farmIds` (replace); perfil + memberships em uma transação |
| `DELETE /memberships/users/:userId?organizationId=` | ADMIN org-wide; remove todas as memberships do usuário na org; **403** se o ator remove a si mesmo |
| `GET /memberships` | ADMIN; inclui `user` (id, name, email); **exclui** `platformRole != NONE` |
| `GET /auth/me` | inclui `memberships` |
| `POST /users` | `@PlatformAdmin()` — vendor provisiona contas (ADR-018) |
| `GET /users` | `@PlatformAdmin()` |
| `GET/PUT/DELETE /users/:id` | próprio usuário **ou** `@PlatformAdmin()` (service) |

## Bootstrap

Fluxo piloto (PR-05.1):

1. `npm run seed:platform-admin` — cria vendor (`PLATFORM_ADMIN`) via env
2. Vendor: `POST /users` (autenticado) → cria conta do cliente
3. Cliente: login → `POST /onboarding` (org + primeira farm) → home com `GET /farms` e `x-farm-id` em catálogo/transações

Alternativa para usuários dentro da org: ADMIN usa `POST /memberships` (Configurações → Usuários no app).

Settings no app: `GET/PATCH /organizations/:id`, `GET/POST/PATCH /farms`, `GET/POST /memberships`, `PATCH/DELETE /memberships/users/:userId` (ADMIN org-wide).

`DELETE /memberships/:id` (por id de membership) foi removido — o subset de fazendas só muda via replace no `PATCH /memberships/users/:userId`.

## Operações restritas a ADMIN (`@FarmAdmin()`)

Cadastros (product, supplier, employee, machine, cost-center, account-plan, uom), `PATCH /crop-seasons/:id/close`, `PUT /crop-seasons/:id/reference-price` e writes em safra `CLOSED` retornam 403 para membership `USER`.

Fechamento de safra (PR-13): `PATCH /crop-seasons/:id/close` cria `SeasonCostingSnapshot`; safra `CLOSED` bloqueia novos lançamentos (atividade, despesa, colheita) via lock transacional (`crop-season-lock.ts`).

## Fechamento de MO CLT (org-wide)

`GET /labor-month-closings/preview` e `POST /labor-month-closings` usam `@FarmScoped()` (header `x-farm-id` para derivar a org) e exigem **ADMIN org-wide** (`farmId: null`), conferido no service via `findOrgAdmin`. Membership pontual com `role: ADMIN` na fazenda do header recebe 403 — o preview expõe folha de toda a org e o fechamento grava `CostEntry` em qualquer fazenda.

## Fora deste recorte

Permissões nomeadas (ADR-013), join table cadastro × N fazendas, namespace `/platform/*` (PR-18+), reopen de safra fechada (planejado INV-REOPEN).
