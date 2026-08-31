import { ConflictException, NotFoundException } from '@nestjs/common';
import { CropSeasonStatus } from '@prisma/client';
import { DeleteCropSeasonService } from './delete-crop-season.service';
import { CropSeasonRepository } from '../repositories/crop-season.repository';

describe('DeleteCropSeasonService', () => {
  const deleteCropSeason = jest.fn<
    ReturnType<CropSeasonRepository['delete']>,
    Parameters<CropSeasonRepository['delete']>
  >();

  const cropSeasonRepository: jest.Mocked<CropSeasonRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: deleteCropSeason,
    findById: jest.fn(),
    updateStatus: jest.fn(),
    countPlantings: jest.fn(),
    searchMany: jest.fn(),
    count: jest.fn(),
  };

  const service = new DeleteCropSeasonService(cropSeasonRepository);

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

  it('throws ConflictException when crop season is closed', async () => {
    cropSeasonRepository.findById.mockResolvedValue({
      id: seasonId,
      farmId,
      cropId: 'crop-id',
      name: 'Manga 25/26',
      startDate: new Date(),
      endDate: null,
      status: CropSeasonStatus.CLOSED,
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

  it('deletes active crop season', async () => {
    cropSeasonRepository.findById.mockResolvedValue({
      id: seasonId,
      farmId,
      cropId: 'crop-id',
      name: 'Manga 25/26',
      startDate: new Date(),
      endDate: null,
      status: CropSeasonStatus.ACTIVE,
      productionUomId: 'uom-id',
      referenceSalePriceInCents: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      crop: { id: 'crop-id', name: 'Manga' },
    });
    deleteCropSeason.mockResolvedValue();

    await service.execute(seasonId, farmId);

    expect(deleteCropSeason).toHaveBeenCalledWith(seasonId);
  });
});
