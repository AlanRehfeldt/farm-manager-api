import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../repositories/user.repository';
import { CreateUserData } from '../repositories/@types';

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute({ name, email, password, role, employeeId }: CreateUserData) {
    const checkIfEmailExists = await this.userRepository.findByEmail(email);
    if (checkIfEmailExists) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.userRepository.create({
      name,
      email,
      password,
      role,
      employeeId,
    });

    return { user };
  }
}
