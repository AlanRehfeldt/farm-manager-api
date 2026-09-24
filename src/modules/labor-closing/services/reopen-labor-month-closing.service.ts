import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { bigintToNumber } from 'src/common/serialization/money';
import { decimalToString } from 'src/common/serialization/decimal';
import {
  MEMBERSHIP_REPOSITORY,
  MembershipRepository,
} from 'src/modules/membership/repositories/membership.repository';
import {
  LABOR_CLOSING_REPOSITORY,
  LaborClosingRepository,
} from '../repositories/labor-closing.repository';

export type ReopenLaborMonthClosingResult = {
  id: string;
  employeeId: string;
  year: number;
  month: number;
  salaryInCents: number;
  totalHours: string;
};

@Injectable()
export class ReopenLaborMonthClosingService {
  constructor(
    @Inject(LABOR_CLOSING_REPOSITORY)
    private readonly laborClosingRepository: LaborClosingRepository,
    @Inject(MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async execute(input: {
    organizationId: string;
    closingId: string;
    reason: string;
    actorUserId: string;
  }): Promise<ReopenLaborMonthClosingResult> {
    const admin = await this.membershipRepository.findOrgAdmin(
      input.actorUserId,
      input.organizationId,
    );
    if (!admin) {
      throw new ForbiddenException(
        'Only organization admins can manage labor month closings',
      );
    }

    const existing = await this.laborClosingRepository.findClosingById(
      input.closingId,
      input.organizationId,
    );
    if (!existing) {
      throw new NotFoundException('Labor month closing not found');
    }

    const closing = await this.laborClosingRepository.reopenClosing({
      closingId: input.closingId,
      organizationId: input.organizationId,
      reason: input.reason,
      reopenedAt: new Date(),
    });

    return {
      id: closing.id,
      employeeId: closing.employeeId,
      year: closing.year,
      month: closing.month,
      salaryInCents: bigintToNumber(closing.salaryInCents)!,
      totalHours: decimalToString(closing.totalHours)!,
    };
  }
}
