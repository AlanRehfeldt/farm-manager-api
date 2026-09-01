import { Test } from '@nestjs/testing';
import { ReverseActivityService } from './reverse-activity.service';
import {
  ACTIVITY_REPOSITORY,
  ActivityRepository,
} from '../repositories/activity.repository';

describe('ReverseActivityService', () => {
  const reverse = jest.fn();
  const activityRepository: jest.Mocked<ActivityRepository> = {
    create: jest.fn(),
    reverse,
    findById: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
    hasEmployeeLaborInSeasonMonth: jest.fn(),
    hasSalaryAllocationInSeasonMonth: jest.fn(),
  };

  let service: ReverseActivityService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        ReverseActivityService,
        { provide: ACTIVITY_REPOSITORY, useValue: activityRepository },
      ],
    }).compile();

    service = module.get(ReverseActivityService);
  });

  it('reverses activity through repository', async () => {
    reverse.mockResolvedValue({
      activity: {
        id: 'activity-1',
        farmId: 'farm-1',
        cropSeasonId: 'season-1',
        fieldId: 'field-1',
        activityType: 'FERTILIZATION',
        date: new Date('2026-03-01'),
        note: '[Estornado] motivo',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUserId: 'user-1',
        field: { id: 'field-1', name: 'Talhão A' },
        cropSeason: {
          id: 'season-1',
          name: '2026',
          crop: { id: 'crop-1', name: 'Maçã' },
        },
        inputs: [],
        labor: [],
        machineHours: [],
        costEntries: [
          {
            sourceType: 'ACTIVITY_INPUT',
            sourceId: 'input-1',
            amountInCents: 1000n,
            reversedAt: new Date('2026-03-02'),
          },
        ],
        reversedAt: new Date('2026-03-02'),
      },
    });

    const result = await service.execute({
      activityId: 'activity-1',
      farmId: 'farm-1',
      reason: 'Quantidade errada',
    });

    expect(reverse).toHaveBeenCalledWith(
      expect.objectContaining({
        activityId: 'activity-1',
        farmId: 'farm-1',
        reason: 'Quantidade errada',
      }),
    );
    expect(result.activity.reversedAt).not.toBeNull();
    expect(result.activity.totalCostInCents).toBe(1000);
  });
});
