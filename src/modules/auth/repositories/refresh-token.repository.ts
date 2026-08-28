export type CreateRefreshTokenData = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export type ValidRefreshToken = {
  id: string;
  userId: string;
};

export interface RefreshTokenRepository {
  create(data: CreateRefreshTokenData): Promise<void>;
  findValidByHash(tokenHash: string): Promise<ValidRefreshToken | null>;
  revokeById(id: string): Promise<void>;
  revokeByHash(tokenHash: string): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY = 'REFRESH_TOKEN_REPOSITORY';
