# Desenvolvimento local

## Pré-requisitos

- Node.js (compatível com Nest 11 / TS 5.7)
- PostgreSQL acessível
- npm

## Setup

```bash
cd farm-manager-api
npm install
cp .env.example .env
# Editar .env — DATABASE_URL e JWT_SECRET (mín. 32 chars)
npx prisma migrate deploy   # ou migrate dev se desenvolvendo schema
npm run dev
```

API em `http://localhost:3000` (ou `SERVER_PORT`).

## Variáveis de ambiente

Copiar `.env.example`. Obrigatórias:

| Variável | Exemplo |
|----------|---------|
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/farm_manager` |
| `JWT_SECRET` | string ≥ 32 caracteres |

Opcionais com default em `src/env.ts`: `SERVER_PORT`, expiração JWT, nomes de cookies, `CORS_ORIGIN`, etc.

Validação: Zod em boot — app falha cedo se env inválida.

## Scripts npm

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Nest watch mode |
| `npm run build` | Build produção |
| `npm run start:prod` | `node dist/main` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm test` | Jest unit (`src/**/*.spec.ts`) |
| `npm run test:e2e` | Jest e2e (`test/`) |

**Nota:** README antigo referia `start:dev` — o script correto é `dev`.

## Documentação interativa

Com a API rodando:

| URL | Conteúdo |
|-----|----------|
| http://localhost:3000/docs | Scalar (recomendado) |
| http://localhost:3000/swagger | Swagger UI |

## Prisma CLI

```bash
npx prisma studio          # UI do banco
npx prisma migrate dev     # nova migration
npx prisma generate        # client
npx prisma db pull         # introspect (cuidado em prod)
```

## Testes

- Unit: `src/**/*.spec.ts` (ex.: `FarmMembershipGuard`, helpers de visibilidade).
- E2e: `test/app.e2e-spec.ts` (auth 401) e `test/tenancy.e2e-spec.ts` (INV-TEN, catálogo compartilhado vs restrito, saldo por fazenda).

E2e precisa de PostgreSQL com migrations aplicadas e `.env` válida (`DATABASE_URL`, `JWT_SECRET`). Arquivos de teste usam `tsconfig.spec.json` (tipos Jest + pasta `test/`).

Ao adicionar testes, ver `.cursor/rules/testing.mdc` e `farm-manager-docs/07-plataforma/03-testing-strategy.md`.

## Estrutura útil

| Caminho | Conteúdo |
|---------|----------|
| `AGENTS.md` | Índice para agentes |
| `docs/` | Esta documentação |
| `.cursor/rules/` | Rules do Cursor |
| `src/modules/` | Feature modules |
| `prisma/` | Schema e migrations |

## Integração com o app

SPA (`farm-manager-app`) em desenvolvimento típico:

- Vite: `http://localhost:5173`
- `CORS_ORIGIN=http://localhost:5173` no `.env` da API
- Frontend com `credentials` nas chamadas HTTP

## Referências

- [README.md](../README.md) — visão rápida do repo
- [05-auth.md](./05-auth.md) — cookies e CORS
