# Documentação de engenharia — Farm Manager API

Documentação **interna do repositório** da API NestJS: como o código está organizado, convenções de implementação e operação local.

**Não é** documentação de produto/domínio. Para visão de negócio, bounded contexts, ADRs e catálogo de erros de domínio, use **`farm-manager-docs`**.

## Índice

| Doc | Conteúdo |
|-----|----------|
| [01-architecture.md](./01-architecture.md) | Camadas, módulos atuais, planejado vs. implementado |
| [02-module-anatomy.md](./02-module-anatomy.md) | Como estruturar um módulo CRUD (receita) |
| [03-http.md](./03-http.md) | Rotas, envelopes de resposta, Swagger/Scalar |
| [04-errors.md](./04-errors.md) | Erros HTTP, validação, exceções Nest |
| [05-auth.md](./05-auth.md) | JWT, cookies, rotas públicas |
| [06-persistence.md](./06-persistence.md) | Prisma, migrations, repositórios |
| [07-development.md](./07-development.md) | Setup local, env, scripts |

## Fronteira com `farm-manager-docs`

| Tópico | Onde |
|--------|------|
| Bounded contexts, rotas futuras, dependências entre módulos | `farm-manager-docs/04-tecnico/03-api-boundaries.md` |
| Arquitetura lógica (tenancy, CostEntry, outbox) | `farm-manager-docs/04-tecnico/04-architecture-overview.md` |
| ADRs (decisões aceitas) | `farm-manager-docs/04-tecnico/adr/00-indice.md` |
| Contrato de módulo (ownership de tabelas, ports) | `farm-manager-docs/07-plataforma/01-module-contract.md` |
| Códigos de erro de domínio (`INSUFFICIENT_STOCK`, etc.) | `farm-manager-docs/04-tecnico/03-api-boundaries.md` |
| Estratégia de testes (INV-*, pirâmide) | `farm-manager-docs/07-plataforma/03-testing-strategy.md` |
| Roadmap de PRs | `farm-manager-docs/03-modulos/04-implementation-roadmap.md` |

Esta pasta documenta **como implementar** no Nest/Prisma; `farm-manager-docs` documenta **o que** o sistema deve fazer.

## Outros recursos neste repo

- [AGENTS.md](../AGENTS.md) — índice para agentes de IA
- `.cursor/rules/` — rules do Cursor alinhadas a estas docs
- OpenAPI interativo: `http://localhost:3000/docs` (Scalar) e `/swagger`

## Convenções de escrita

- Prosa: português
- Código, rotas, enums, tabelas: inglês (ADR-016)
