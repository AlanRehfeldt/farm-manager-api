import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CROP_REPOSITORY,
  CropRepository,
} from '../repositories/crop.repository';

@Injectable()
export class DeleteCropService {
  constructor(
    @Inject(CROP_REPOSITORY)
    private readonly cropRepository: CropRepository,
  ) {}

  async execute(id: string, organizationId: string) {
    const existing = await this.cropRepository.findById(id, organizationId);
    if (!existing) {
      throw new NotFoundException('Crop does not exist');
    }

    try {
      await this.cropRepository.delete(id);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Crop is referenced by crop seasons or varieties',
        );
      }
      throw error;
    }
  }
}
