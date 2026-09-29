import { OrganizationSelection } from '@prisma/client';

export type CreateRefreshTokenData = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  organizationId: string | null;
  organizationSelection: OrganizationSelection;
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
  organizationId: string | null;
  organizationSelection: OrganizationSelection;
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
