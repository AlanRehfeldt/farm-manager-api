import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MEMBERSHIP_REPOSITORY,
  MembershipRepository,
} from 'src/modules/membership/repositories/membership.repository';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/modules/user/repositories/user.repository';
import { MeResultDto } from '../dtos/response/me-result.dto';

@Injectable()
export class MeService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async execute(userId: string): Promise<MeResultDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const memberships = await this.membershipRepository.findManyByUser(userId);
    const { password, ...userWithoutPassword } = user;
    void password;

    return new MeResultDto({
      ...userWithoutPassword,
      employeeId: userWithoutPassword.employeeId ?? undefined,
      memberships,
    });
  }
}
