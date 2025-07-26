import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../repositories/user.repository';

@Injectable()
export class DeleteUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string) {
    const checkIfUserExists = await this.userRepository.findById(id);
    if (!checkIfUserExists) {
      throw new NotFoundException('User does not exist');
    }

    return await this.userRepository.delete(id);
  }
}
