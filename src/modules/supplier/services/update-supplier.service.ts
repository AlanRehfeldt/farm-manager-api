import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { cnpj as cnpjValidator } from 'cpf-cnpj-validator';
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
    { id, name, cnpj, address, phoneNumber }: UpdateSupplierData,
  ) {
    const checkIfSupplierExists = await this.supplierRepository.findById(
      id,
      organizationId,
      farmId,
    );
    if (!checkIfSupplierExists) {
      throw new NotFoundException('Supplier does not exist');
    }

    if (cnpj) {
      const checkIfCnpjIsValid = cnpjValidator.isValid(cnpj);
      if (!checkIfCnpjIsValid) {
        throw new BadRequestException('Invalid CNPJ');
      }

      const duplicate = await this.supplierRepository.findByCnpj(
        organizationId,
        cnpj,
      );
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('CNPJ already exists');
      }
    }

    const supplier = await this.supplierRepository.update({
      id,
      name,
      cnpj,
      address,
      phoneNumber,
    });

    return { supplier };
  }
}
