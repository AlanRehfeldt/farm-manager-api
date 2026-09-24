import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { cnpj as cnpjValidator, cpf as cpfValidator } from 'cpf-cnpj-validator';
import { UpdateSupplierData } from '../repositories/@types';
import {
  SUPPLIER_REPOSITORY,
  SupplierRepository,
} from '../repositories/supplier.repository';

@Injectable()
export class UpdateSupplierService {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async execute(
    organizationId: string,
    farmId: string,
    data: UpdateSupplierData,
  ) {
    const existing = await this.supplierRepository.findById(
      data.id,
      organizationId,
      farmId,
    );
    if (!existing) {
      throw new NotFoundException('Supplier does not exist');
    }

    const nextCnpj = data.cnpj !== undefined ? data.cnpj : existing.cnpj;
    const nextCpf = data.cpf !== undefined ? data.cpf : existing.cpf;

    const hasCnpj = nextCnpj != null && nextCnpj !== '';
    const hasCpf = nextCpf != null && nextCpf !== '';

    if (hasCnpj === hasCpf) {
      throw new BadRequestException('Provide exactly one of CNPJ or CPF');
    }

    if (hasCnpj && nextCnpj) {
      if (!cnpjValidator.isValid(nextCnpj)) {
        throw new BadRequestException('Invalid CNPJ');
      }

      const duplicate = await this.supplierRepository.findByCnpj(
        organizationId,
        nextCnpj,
      );
      if (duplicate && duplicate.id !== data.id) {
        throw new ConflictException('CNPJ already exists');
      }
    }

    if (hasCpf && nextCpf) {
      if (!cpfValidator.isValid(nextCpf)) {
        throw new BadRequestException('Invalid CPF');
      }

      const duplicate = await this.supplierRepository.findByCpf(
        organizationId,
        nextCpf,
      );
      if (duplicate && duplicate.id !== data.id) {
        throw new ConflictException('CPF already exists');
      }
    }

    const supplier = await this.supplierRepository.update({
      id: data.id,
      name: data.name,
      cnpj: hasCnpj ? nextCnpj : null,
      cpf: hasCpf ? nextCpf : null,
      address: data.address,
      city: data.city,
      state: data.state,
      phoneNumber: data.phoneNumber,
    });

    return { supplier };
  }
}
