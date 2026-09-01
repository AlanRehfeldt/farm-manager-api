export type CreateRefreshTokenData = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export type ValidRefreshToken = {
  id: string;
  userId: string;
};

export type StoredRefreshToken = {
  id: string;
  userId: string;
  revokedAt: Date | null;
  expiresAt: Date;
};

export interface RefreshTokenRepository {
  create(data: CreateRefreshTokenData): Promise<void>;
  findValidByHash(tokenHash: string): Promise<ValidRefreshToken | null>;
  findByHash(tokenHash: string): Promise<StoredRefreshToken | null>;
  revokeById(id: string): Promise<void>;
  revokeByHash(tokenHash: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY = 'REFRESH_TOKEN_REPOSITORY';
