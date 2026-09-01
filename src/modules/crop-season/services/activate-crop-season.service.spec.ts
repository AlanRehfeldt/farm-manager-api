import { ConflictException, NotFoundException } from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import { ActivateCropSeasonService } from './activate-crop-season.service';
import { CropSeasonRepository } from '../repositories/crop-season.repository';

describe('ActivateCropSeasonService', () => {
  const updateStatus = jest.fn<
    ReturnType<CropSeasonRepository['updateStatus']>,
    Parameters<CropSeasonRepository['updateStatus']>
  >();

  const cropSeasonRepository: jest.Mocked<CropSeasonRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    updateStatus,
    countPlantings: jest.fn(),
    hasOperationalData: jest.fn(),
    countHarvests: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const service = new ActivateCropSeasonService(cropSeasonRepository);

  const farmId = 'farm-id';
  const seasonId = 'season-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws NotFoundException when crop season does not exist', async () => {
    cropSeasonRepository.findById.mockResolvedValue(null);

    await expect(service.execute(seasonId, farmId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws ConflictException when crop season is already active', async () => {
    cropSeasonRepository.findById.mockResolvedValue({
      id: seasonId,
      farmId,
      cropId: 'crop-id',
      name: 'Manga 25/26',
      startDate: new Date('2025-08-01'),
      endDate: null,
      status: CropSeasonStatus.ACTIVE,
      productionUomId: 'uom-id',
      referenceSalePriceInCents: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      crop: { id: 'crop-id', name: 'Manga' },
    });

    await expect(service.execute(seasonId, farmId)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('throws ConflictException when crop season has no plantings', async () => {
    cropSeasonRepository.findById.mockResolvedValue({
      id: seasonId,
      farmId,
      cropId: 'crop-id',
      name: 'Manga 25/26',
      startDate: new Date('2025-08-01'),
      endDate: null,
      status: CropSeasonStatus.PLANNED,
      productionUomId: 'uom-id',
      referenceSalePriceInCents: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      crop: { id: 'crop-id', name: 'Manga' },
    });
    cropSeasonRepository.countPlantings.mockResolvedValue(0);

    await expect(service.execute(seasonId, farmId)).rejects.toThrow(
      'Crop season cannot be activated without plantings',
    );
  });

  it('activates planned crop season when plantings exist', async () => {
    cropSeasonRepository.findById.mockResolvedValue({
      id: seasonId,
      farmId,
      cropId: 'crop-id',
      name: 'Manga 25/26',
      startDate: new Date('2025-08-01'),
      endDate: null,
      status: CropSeasonStatus.PLANNED,
      productionUomId: 'uom-id',
      referenceSalePriceInCents: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      crop: { id: 'crop-id', name: 'Manga' },
    });
    cropSeasonRepository.countPlantings.mockResolvedValue(2);
    updateStatus.mockResolvedValue({
      id: seasonId,
      farmId,
      cropId: 'crop-id',
      name: 'Manga 25/26',
      startDate: new Date('2025-08-01'),
      endDate: null,
      status: CropSeasonStatus.ACTIVE,
      productionUomId: 'uom-id',
      referenceSalePriceInCents: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      crop: { id: 'crop-id', name: 'Manga' },
    });

    const result = await service.execute(seasonId, farmId);

    expect(updateStatus).toHaveBeenCalledWith(
      seasonId,
      CropSeasonStatus.ACTIVE,
    );
    expect(result.cropSeason.status).toBe('ACTIVE');
  });
});
