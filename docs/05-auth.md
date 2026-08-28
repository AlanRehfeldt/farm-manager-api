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

`GET /auth/me` devolve `memberships` (`farmId` null = org-wide).

## Guard global

`JwtAuthGuard` registrado como `APP_GUARD` em `AuthModule`. Todas as rotas exigem cookie de access válido **exceto** as marcadas com `@Public()`.

## Rotas públicas além de auth

| Método | Rota | Nota |
|--------|------|------|
| `POST` | `/users` | Registro de usuário aberto |

Todas as outras rotas dos módulos de feature exigem auth.

## Decorators

```typescript
import { Public } from 'src/modules/auth/decorators/public.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';

@Public()
@Post('login')

@Get('me')
me(@CurrentUser() user: { userId: string }) { /* ... */ }
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

## Frontend

Requisições cross-origin precisam de `credentials: 'include'` (ou equivalente). CORS na API com `credentials: true`.

## O que não está implementado

| Item | Planejado |
|------|-----------|
| Guards de role (`ADMIN` vs `USER`) em rotas de catálogo | ADR-013; hoje ADMIN é checado no service de org/farm/membership |
| ACL nomeada | ADR-013 |
| Bearer como fluxo principal | Não — cookies são o padrão atual |

Não documentar Bearer no OpenAPI como mecanismo principal sem mudança de arquitetura.

## Referências

- [08-tenancy.md](./08-tenancy.md)
- `src/modules/auth/`
- [03-http.md](./03-http.md)
- `farm-manager-docs/03-modulos/04-implementation-roadmap.md` (PR-02 auth)
