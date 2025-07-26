import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  COST_CENTER_REPOSITORY,
  CostCenterRepository,
} from '../repositories/cost-center.repository';
import { CreateCostCenterData } from '../repositories/@types';

@Injectable()
export class CreateCostCenterService {
  constructor(
    @Inject(COST_CENTER_REPOSITORY)
    private readonly costcenterRepository: CostCenterRepository,
  ) {}

  async execute({ name, description, code, parentId }: CreateCostCenterData) {
    const checkIfCodeExists = await this.costcenterRepository.findByCode(code);
    if (checkIfCodeExists) {
      throw new ConflictException('Code already exists');
    }

    if (parentId) {
      const checkIfParentIdExists =
        await this.costcenterRepository.findById(parentId);
      if (!checkIfParentIdExists) {
        throw new NotFoundException('ParentId does not exist');
      }
    }

    const costcenter = await this.costcenterRepository.create({
      name,
      description,
      code,
      parentId,
    });

    return { costcenter };
  }
}
