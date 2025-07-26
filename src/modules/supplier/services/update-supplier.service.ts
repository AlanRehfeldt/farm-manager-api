import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  SUPPLIER_REPOSITORY,
  SupplierRepository,
} from '../repositories/supplier.repository';
import { UpdateSupplierData } from '../repositories/@types';
import { cnpj as cnpjValidator } from 'cpf-cnpj-validator';

@Injectable()
export class UpdateSupplierService {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async execute({ id, name, cnpj, address, phoneNumber }: UpdateSupplierData) {
    const checkIfSupplierExists = await this.supplierRepository.findById(id);
    if (!checkIfSupplierExists) {
      throw new NotFoundException('Supplier does not exist');
    }

    if (cnpj) {
      const checkIfCnpjIsValid = cnpjValidator.isValid(cnpj);
      if (!checkIfCnpjIsValid) {
        throw new BadRequestException('Invalid CNPJ');
      }

      const checkIfCnpjExists = await this.supplierRepository.findByCnpj(cnpj);
      if (checkIfCnpjExists) {
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
