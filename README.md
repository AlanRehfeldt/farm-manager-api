# Farm Manager API

REST API do Farm Manager — NestJS 11, Prisma 6, PostgreSQL, validação com Zod 4, autenticação JWT via cookies httpOnly.

## Documentação

| Recurso | Descrição |
|---------|-----------|
| [docs/](./docs/README.md) | Engenharia da API (arquitetura, módulos, HTTP, erros, auth, Prisma) |
| [AGENTS.md](./AGENTS.md) | Índice para agentes de IA |
| Domínio e produto | Repositório `farm-manager-docs` |

Com a API rodando:

- **Scalar:** http://localhost:3000/docs
- **Swagger UI:** http://localhost:3000/swagger

## Setup rápido

```bash
npm install
cp .env.example .env
# Configure DATABASE_URL e JWT_SECRET (mín. 32 caracteres)
npx prisma migrate deploy
npm run dev
```

Detalhes: [docs/07-development.md](./docs/07-development.md).

## Stack

- NestJS 11 — monólito modular
- Prisma 6 — PostgreSQL
- Zod 4 — validação de input e env
- Passport JWT — cookies `fm_access_token` / `fm_refresh_token`
- OpenAPI — `@nestjs/swagger` + Scalar

## Estrutura

```
src/
  modules/     # Feature modules (product, auth, user, …)
  common/      # Prisma, pipes, DTOs de erro
  env.ts       # Schema de variáveis de ambiente
prisma/        # Schema e migrations
docs/          # Documentação de engenharia
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento (watch) |
| `npm run build` | Build |
| `npm run start:prod` | Produção |
| `npm test` | Testes unitários |
| `npm run lint` | ESLint |

## Convenções

- Validação com **Zod** + `ZodValidationPipe` (não `class-validator`)
- Resposta comando/get: `{ statusCode, message, result }`
- Listagem: `{ results, total, page, perPage, orderBy, orderDirection }`
- Rules do Cursor: `.cursor/rules/`

Ver [docs/02-module-anatomy.md](./docs/02-module-anatomy.md) para criar um novo módulo.
