# Persistência — Prisma

## Schema e banco

- **Schema:** `prisma/schema.prisma`
- **Banco:** PostgreSQL (`DATABASE_URL`)
- **Versão:** Prisma 7 (`prisma` / `@prisma/client` ^7.10)
- **Conexão:** `DATABASE_URL` em `prisma.config.ts` (CLI/Migrate). O schema não declara `url`. O runtime usa `@prisma/adapter-pg`.
- **Mapeamento:** `@@map("snake_case_tables")` nos models

O schema reflete o estado **implementado** — pode divergir do modelo conceitual em `farm-manager-docs/04-tecnico/02-proposed-data-model.md` até as migrações de domínio.

### Entidades agrícolas (PR-06)

| Model | Escopo | Notas |
|-------|--------|-------|
| `Field` | farm | `areaHa` Decimal(18,6); unique `(farmId, name)` |
| `Crop` | org | `defaultProductionUomId?`; unique `(organizationId, name)` |
| `Variety` | crop | unique `(cropId, name)` |
| `CropSeason` | farm | `cropId` obrigatório (ADR-010); status `PLANNED \| ACTIVE \| CLOSED` |
| `CropPlanting` | season × field | unique `(cropSeasonId, fieldId)` |
| `Machine` | farm | `hourlyCostInCents` BigInt; `fuelIncludedInHourlyCost` default true |

Serialização: Decimals como string na API; centavos como number no JSON (BigInt no banco).

## PrismaService

```typescript
// src/common/prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(configService: ConfigService<Env, true>) {
    const adapter = new PrismaPg({
      connectionString: configService.get('DATABASE_URL', { infer: true }),
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
```

`PrismaModule` exporta `PrismaService`. Feature modules importam `PrismaModule`; **repositories** injetam `PrismaService` — não os services de use case.

## Padrão de repositório

1. Interface em `{entity}.repository.ts` + token string (`PRODUCT_REPOSITORY`).
2. Tipos de input em `@types.ts` (`CreateXData`, `UpdateXData`, `SearchManyQuery`).
3. `PrismaXRepository` implementa a interface.

Services injetam `@Inject(ENTITY_REPOSITORY)` — desacoplados de Prisma.

### Cross-módulo

- Exportar token do módulo dono da tabela.
- Importar o módulo — não usar `PrismaClient` de outro contexto diretamente.
- Alvo futuro (ADR-016): ports explícitos em vez de repositórios compartilhados entre bounded contexts.

## Migrations

```bash
# desenvolvimento — cria e aplica migration
npx prisma migrate dev --name descriptive_name

# aplicar migrations em deploy
npx prisma migrate deploy

# regenerar client após mudança de schema
npx prisma generate
```

Migrations em `prisma/migrations/`. Não editar migrations já aplicadas — criar nova migration.

## Índices parciais

O Prisma não expressa `WHERE` em `@@unique`. Estes três índices existem só no SQL da migration; um `prisma migrate diff` a partir do schema não os recria. Não substituir por `@@unique`.

- `support_accesses_active_user_org_unique` em `support_accesses` (`userId`, `organizationId`) onde `revokedAt` é nulo — `prisma/migrations/20260929180000_support_access_and_audit_log/migration.sql`. `GrantSupportAccessService` mapeia o `P2002` desse índice para 409. Sem ele, conceder duas vezes cria duas linhas ativas e revogar uma não encerra a outra.
- `memberships_user_org_wide_unique` em `memberships` (`userId`, `organizationId`) onde `farmId` é nulo — `prisma/migrations/20260903190000_membership_partial_uniques/migration.sql`.
- `memberships_user_org_farm_unique` em `memberships` (`userId`, `organizationId`, `farmId`) onde `farmId` não é nulo — a mesma migration. Postgres trata nulos como distintos em `UNIQUE`, então o vínculo org-wide precisa do índice próprio.

## Transações

`prisma.$transaction()` é usado em create de Organization (org + membership ADMIN). Para use cases que alteram múltiplas tabelas e exigem atomicidade, usar transação no repository ou service que orquestra:

```typescript
await this.prisma.$transaction(async (tx) => {
  await tx.product.create({ ... });
  await tx.stockMovement.create({ ... });
});
```

## O que não existe hoje

| Recurso | Nota |
|---------|------|
| Soft delete | Deletes são hard `delete()` |
| `$extends` / client extensions | Não usado |
| Driver adapters | PostgreSQL via `@prisma/adapter-pg` no `PrismaService` e no seed |
| Tenancy filters automáticos | Não — filtro nos repositórios (`organizationId` / visibilidade / `farmId`). Ver [08-tenancy.md](./08-tenancy.md) |
| Optimistic locking global | Planejado para saldo/version em inventory |

## Seeds

Script de bootstrap do vendor (PR-05.1, ADR-018):

```bash
# .env — PLATFORM_ADMIN_EMAIL, PLATFORM_ADMIN_PASSWORD (ver .env.example)
npm run seed:platform-admin
```

- Arquivo: `prisma/seed.ts` — upsert por e-mail; `platformRole = PLATFORM_ADMIN`.
- Credenciais de seed **não** entram em `src/env.ts` (boot da API não depende delas).
- Demo/seed de produto: ver `farm-manager-docs/07-plataforma/03-testing-strategy.md` quando existir.

## Referências

- [02-module-anatomy.md](./02-module-anatomy.md)
- `farm-manager-docs/04-tecnico/01-current-state-assessment.md` — veredicto sobre entidades Prisma
- `farm-manager-docs/04-tecnico/adr/009-numeric-precision.md` — precisão numérica
