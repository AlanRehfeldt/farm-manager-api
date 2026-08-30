import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  FIELD_REPOSITORY,
  FieldRepository,
} from '../repositories/field.repository';

@Injectable()
export class DeleteFieldService {
  constructor(
    @Inject(FIELD_REPOSITORY)
    private readonly fieldRepository: FieldRepository,
  ) {}

  async execute(id: string, farmId: string) {
    const existing = await this.fieldRepository.findById(id, farmId);
    if (!existing) {
      throw new NotFoundException('Field does not exist');
    }

    try {
      await this.fieldRepository.delete(id);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException('Field is referenced by crop plantings');
      }
      throw error;
    }
  }
}
