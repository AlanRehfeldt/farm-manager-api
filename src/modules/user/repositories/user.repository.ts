import { User } from '@prisma/client';
import { CreateUserData, SearchManyQuery, UpdateUserData } from './@types';

export interface UserRepository {
  create(data: CreateUserData): Promise<User>;
  update(data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  searchMany(query: SearchManyQuery): Promise<User[]>;
  count(query: SearchManyQuery): Promise<number>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';
