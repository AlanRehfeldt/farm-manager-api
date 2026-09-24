import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { MembershipRepository } from 'src/modules/membership/repositories/membership.repository';
import { LaborClosingRepository } from '../repositories/labor-closing.repository';
import { ReopenLaborMonthClosingService } from './reopen-labor-month-closing.service';

describe('ReopenLaborMonthClosingService', () => {
  const membershipRepository: jest.Mocked<
    Pick<MembershipRepository, 'findOrgAdmin'>
  > = {
    findOrgAdmin: jest.fn(),
  };

  const laborClosingRepository: jest.Mocked<
    Pick<LaborClosingRepository, 'findClosingById' | 'reopenClosing'>
  > = {
    findClosingById: jest.fn(),
    reopenClosing: jest.fn(),
  };

  const service = new ReopenLaborMonthClosingService(
    laborClosingRepository as unknown as LaborClosingRepository,
    membershipRepository as unknown as MembershipRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    membershipRepository.findOrgAdmin.mockResolvedValue({
      id: 'membership-org-admin',
    } as never);
    laborClosingRepository.findClosingById.mockResolvedValue({
      id: 'closing-1',
      organizationId: 'org-1',
      employeeId: 'emp-1',
      year: 2026,
      month: 9,
      salaryInCents: 320000n,
      totalHours: new Decimal(160),
      closedByUserId: 'user-1',
      closedAt: new Date('2026-09-30T12:00:00.000Z'),
    });
    laborClosingRepository.reopenClosing.mockResolvedValue({
      id: 'closing-1',
      organizationId: 'org-1',
      employeeId: 'emp-1',
      year: 2026,
      month: 9,
      salaryInCents: 320000n,
      totalHours: new Decimal(160),
      closedByUserId: 'user-1',
      closedAt: new Date('2026-09-30T12:00:00.000Z'),
    });
  });

  it('rejects when actor is only a farm-scoped admin', async () => {
    membershipRepository.findOrgAdmin.mockResolvedValue(null);

    await expect(
      service.execute({
        organizationId: 'org-1',
        closingId: 'closing-1',
        reason: 'Need to redistribute',
        actorUserId: 'user-farm-admin',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(laborClosingRepository.reopenClosing).not.toHaveBeenCalled();
  });

  it('rejects when closing does not belong to the organization', async () => {
    laborClosingRepository.findClosingById.mockResolvedValue(null);

    await expect(
      service.execute({
        organizationId: 'org-1',
        closingId: 'missing',
        reason: 'Need to redistribute',
        actorUserId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(laborClosingRepository.reopenClosing).not.toHaveBeenCalled();
  });

  it('reopens closing and returns employee competence totals', async () => {
    const result = await service.execute({
      organizationId: 'org-1',
      closingId: 'closing-1',
      reason: 'Need to redistribute salary',
      actorUserId: 'user-1',
    });

    expect(laborClosingRepository.reopenClosing).toHaveBeenCalledWith(
      expect.objectContaining({
        closingId: 'closing-1',
        organizationId: 'org-1',
        reason: 'Need to redistribute salary',
      }),
    );
    expect(result).toEqual({
      id: 'closing-1',
      employeeId: 'emp-1',
      year: 2026,
      month: 9,
      salaryInCents: 320000,
      totalHours: '160',
    });
  });
});
