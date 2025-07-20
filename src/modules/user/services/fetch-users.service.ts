import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../repositories/user.repository';
import { SearchManyQuery } from '../repositories/@types';

@Injectable()
export class FetchUsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(params: SearchManyQuery) {
    const users = await this.userRepository.searchMany(params);
    const total = await this.userRepository.count(params);

    const usersWithoutPassword = users.map((user) => ({
      ...user,
      password: undefined,
    }));

    return {
      results: usersWithoutPassword,
      total,
      page: params.page,
      perPage: params.perPage,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };
  }
}
