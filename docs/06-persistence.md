# Persistência — Prisma

## Schema e banco

- **Schema:** `prisma/schema.prisma`
- **Banco:** PostgreSQL (`DATABASE_URL`)
- **Versão:** Prisma 6 (`prisma` / `@prisma/client` ^6.11)
- **Mapeamento:** `@@map("snake_case_tables")` nos models

O schema reflete o estado **implementado** — pode divergir do modelo conceitual em `farm-manager-docs/04-tecnico/02-proposed-data-model.md` até as migrações de domínio.

## PrismaService

```typescript
// src/common/prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
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

## Transações

`prisma.$transaction()` **não é usado** amplamente hoje. Para use cases que alteram múltiplas tabelas e exigem atomicidade, usar transação no repository ou service que orquestra:

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
| Driver adapters (Prisma 7) | Projeto em Prisma 6 |
| Tenancy filters automáticos | Planejado com tenancy ADR |
| Optimistic locking global | Planejado para saldo/version em inventory |

## Seeds

Sem script de seed documentado no repo. Demo/seed de produto: ver `farm-manager-docs/07-plataforma/03-testing-strategy.md` quando existir.

## Referências

- [02-module-anatomy.md](./02-module-anatomy.md)
- `farm-manager-docs/04-tecnico/01-current-state-assessment.md` — veredicto sobre entidades Prisma
- `farm-manager-docs/04-tecnico/adr/009-numeric-precision.md` — precisão numérica
