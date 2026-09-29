import { OrganizationStatus, User } from '@prisma/client';
import { CreateUserData, SearchManyQuery, UpdateUserData } from './@types';

export type UserSession = User & {
  memberships: Array<{
    organization: {
      status: OrganizationStatus;
    };
  }>;
};

export interface UserRepository {
  create(data: CreateUserData): Promise<User>;
  update(data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findSessionById(id: string): Promise<UserSession | null>;
  findSessionByEmail(email: string): Promise<UserSession | null>;
  searchMany(query: SearchManyQuery): Promise<User[]>;
  count(query: SearchManyQuery): Promise<number>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';
