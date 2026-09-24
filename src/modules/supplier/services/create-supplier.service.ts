import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { cnpj as cnpjValidator, cpf as cpfValidator } from 'cpf-cnpj-validator';
import { resolveOptionalFarmId } from 'src/common/tenancy/resolve-optional-farm-id';
import {
  SUPPLIER_REPOSITORY,
  SupplierRepository,
} from '../repositories/supplier.repository';

type CreateSupplierInput = {
  name: string;
  cnpj?: string;
  cpf?: string;
  address?: string;
  city?: string;
  state?: string;
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
    const hasCnpj = Boolean(input.cnpj);
    const hasCpf = Boolean(input.cpf);

    if (hasCnpj === hasCpf) {
      throw new BadRequestException('Provide exactly one of CNPJ or CPF');
    }

    if (input.cnpj) {
      if (!cnpjValidator.isValid(input.cnpj)) {
        throw new BadRequestException('Invalid CNPJ');
      }

      const duplicate = await this.supplierRepository.findByCnpj(
        input.organizationId,
        input.cnpj,
      );
      if (duplicate) {
        throw new ConflictException('CNPJ already exists');
      }
    }

    if (input.cpf) {
      if (!cpfValidator.isValid(input.cpf)) {
        throw new BadRequestException('Invalid CPF');
      }

      const duplicate = await this.supplierRepository.findByCpf(
        input.organizationId,
        input.cpf,
      );
      if (duplicate) {
        throw new ConflictException('CPF already exists');
      }
    }

    const farmId = resolveOptionalFarmId(input.farmId, input.activeFarmId);

    const supplier = await this.supplierRepository.create({
      name: input.name,
      cnpj: input.cnpj ?? null,
      cpf: input.cpf ?? null,
      address: input.address,
      city: input.city,
      state: input.state,
      phoneNumber: input.phoneNumber,
      organizationId: input.organizationId,
      farmId,
    });

    return { supplier };
  }
}
