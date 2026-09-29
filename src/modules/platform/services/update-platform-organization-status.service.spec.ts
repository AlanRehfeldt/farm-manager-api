import { NotFoundException } from '@nestjs/common';
import { Organization, OrganizationStatus } from '@prisma/client';
import { PlatformRepository } from '../repositories/platform.repository';
import { UpdatePlatformOrganizationStatusService } from './update-platform-organization-status.service';

describe('UpdatePlatformOrganizationStatusService', () => {
  let service: UpdatePlatformOrganizationStatusService;
  let platformRepository: jest.Mocked<
    Pick<PlatformRepository, 'updateOrganizationStatus'>
  >;

  const organization = {
    id: 'org-1',
    name: 'Rehfeldt Agro',
    status: OrganizationStatus.SUSPENDED,
  } as Organization;

  beforeEach(() => {
    platformRepository = {
      updateOrganizationStatus: jest.fn(),
    };
    service = new UpdatePlatformOrganizationStatusService(
      platformRepository as unknown as PlatformRepository,
    );
  });

  it('returns the organization when the same status is applied again', async () => {
    platformRepository.updateOrganizationStatus.mockResolvedValue(organization);

    await expect(
      service.execute('org-1', OrganizationStatus.SUSPENDED, 'actor-1'),
    ).resolves.toEqual({
      id: 'org-1',
      name: 'Rehfeldt Agro',
      status: OrganizationStatus.SUSPENDED,
    });

    expect(platformRepository.updateOrganizationStatus).toHaveBeenCalledWith(
      'org-1',
      OrganizationStatus.SUSPENDED,
      'actor-1',
    );
  });

  it('returns 404 when the organization does not exist', async () => {
    platformRepository.updateOrganizationStatus.mockResolvedValue(null);

    await expect(
      service.execute('missing', OrganizationStatus.ACTIVE, 'actor-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
