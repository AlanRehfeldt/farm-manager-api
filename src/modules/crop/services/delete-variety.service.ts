import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  VARIETY_REPOSITORY,
  VarietyRepository,
} from '../repositories/variety.repository';

@Injectable()
export class DeleteVarietyService {
  constructor(
    @Inject(VARIETY_REPOSITORY)
    private readonly varietyRepository: VarietyRepository,
  ) {}

  async execute(id: string, organizationId: string) {
    const existing = await this.varietyRepository.findById(id, organizationId);
    if (!existing) {
      throw new NotFoundException('Variety does not exist');
    }

    try {
      await this.varietyRepository.delete(id);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException('Variety is referenced by crop plantings');
      }
      throw error;
    }
  }
}
