# Autenticação

## Modelo

- **Access token** (JWT curto) + **refresh token** (JWT longo) em cookies **httpOnly**.
- Nomes padrão: `fm_access_token`, `fm_refresh_token` (configuráveis via env).
- Passport JWT strategy lê o access token do cookie — **não** do header `Authorization: Bearer`.

## Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/auth/login` | `@Public()` | Email + senha → set cookies |
| `POST` | `/auth/refresh` | `@Public()` | Refresh cookie → novos tokens |
| `POST` | `/auth/logout` | `@Public()` | Revoga refresh, limpa cookies |
| `GET` | `/auth/me` | Protegido | Usuário atual + memberships |

## Tenancy

Rotas de catálogo e lançamentos: `@FarmScoped()` + header `x-farm-id`. Ver [08-tenancy.md](./08-tenancy.md).

`GET /auth/me` devolve `memberships` (`farmId` null = org-wide) e `platformRole`.

## Guard global

`JwtAuthGuard` registrado como `APP_GUARD` em `AuthModule`. Todas as rotas exigem cookie de access válido **exceto** as marcadas com `@Public()`.

## Rotas públicas

| Método | Rota | Nota |
|--------|------|------|
| `POST` | `/auth/login` | Login |
| `POST` | `/auth/refresh` | Renovação de sessão |
| `POST` | `/auth/logout` | Logout |

**Não há cadastro público.** `POST /users` exige `@PlatformAdmin()` (ADR-018).

## Platform admin

Decorator `@PlatformAdmin()` em `src/common/platform/` — guard lê `User.platformRole` no banco. Usado em `POST /users` e `GET /users`. Rotas `GET/PUT/DELETE /users/:id` checam próprio usuário ou platform admin no service.

Bootstrap do vendor: `npm run seed:platform-admin` (env `PLATFORM_ADMIN_*`). Ver [06-persistence.md](./06-persistence.md).

## Decorators

```typescript
import { Public } from 'src/modules/auth/decorators/public.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { PlatformAdmin } from 'src/common/platform/platform-admin.decorator';

@Public()
@Post('login')

@PlatformAdmin()
@Post('/users')
```

## Refresh tokens

- Persistidos hasheados em tabela `refresh_tokens` (`RefreshToken` model).
- `TokenService` emite pares e define cookies com opções de `COOKIE_SECURE` e `COOKIE_SAME_SITE`.

## Variáveis de ambiente

Ver `.env.example` e `src/env.ts`:

| Variável | Descrição |
|----------|-----------|
| `JWT_SECRET` | Mín. 32 caracteres |
| `JWT_ACCESS_EXPIRES_IN` | Default `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Default `7d` |
| `JWT_ACCESS_COOKIE_NAME` | Default `fm_access_token` |
| `JWT_REFRESH_COOKIE_NAME` | Default `fm_refresh_token` |
| `COOKIE_SECURE` | `true`/`false` |
| `COOKIE_SAME_SITE` | `strict`, `lax`, `none` |
| `CORS_ORIGIN` | Origem do SPA (ex. `http://localhost:5173`) |

Credenciais de seed (`PLATFORM_ADMIN_*`) — apenas para `npm run seed:platform-admin`; não validadas no boot da API.

## Frontend

Requisições cross-origin precisam de `credentials: 'include'` (ou equivalente). CORS na API com `credentials: true`.

## O que não está implementado

| Item | Planejado |
|------|-----------|
| Guards de role (`ADMIN` vs `USER`) em rotas de catálogo | ADR-013; hoje ADMIN é checado no service de org/farm/membership |
| ACL nomeada | ADR-013 |
| Bearer como fluxo principal | Não — cookies são o padrão atual |
| Namespace `/platform/*` e console vendor | PR-18+ |

Não documentar Bearer no OpenAPI como mecanismo principal sem mudança de arquitetura.

## Referências

- [08-tenancy.md](./08-tenancy.md)
- `src/modules/auth/`
- `src/common/platform/`
- [03-http.md](./03-http.md)
- `farm-manager-docs/03-modulos/04-implementation-roadmap.md` (PR-02 auth, PR-05.1 platform)
