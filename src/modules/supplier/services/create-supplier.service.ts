import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { cnpj as cnpjValidator } from 'cpf-cnpj-validator';
import { resolveOptionalFarmId } from 'src/common/tenancy/resolve-optional-farm-id';
import {
  SUPPLIER_REPOSITORY,
  SupplierRepository,
} from '../repositories/supplier.repository';

type CreateSupplierInput = {
  name: string;
  cnpj: string;
  address?: string;
  phoneNumber?: string;
  farmId?: string | null;
  organizationId: string;
  activeFarmId: string;
};

@Injectable()
export class CreateSupplierService {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async execute(input: CreateSupplierInput) {
    const checkIfCnpjIsValid = cnpjValidator.isValid(input.cnpj);
    if (!checkIfCnpjIsValid) {
      throw new BadRequestException('Invalid CNPJ');
    }

    const checkIfCnpjExists = await this.supplierRepository.findByCnpj(
      input.organizationId,
      input.cnpj,
    );
    if (checkIfCnpjExists) {
      throw new ConflictException('CNPJ already exists');
    }

    const farmId = resolveOptionalFarmId(input.farmId, input.activeFarmId);

    const supplier = await this.supplierRepository.create({
      name: input.name,
      cnpj: input.cnpj,
      address: input.address,
      phoneNumber: input.phoneNumber,
      organizationId: input.organizationId,
      farmId,
    });

    return { supplier };
  }
}
