import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  SUPPLIER_REPOSITORY,
  SupplierRepository,
} from '../repositories/supplier.repository';
import { CreateSupplierData } from '../repositories/@types';
import { cnpj as cnpjValidator } from 'cpf-cnpj-validator';

@Injectable()
export class CreateSupplierService {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async execute({ name, cnpj, address, phoneNumber }: CreateSupplierData) {
    const checkIfCnpjIsValid = cnpjValidator.isValid(cnpj);
    if (!checkIfCnpjIsValid) {
      throw new BadRequestException('Invalid CNPJ');
    }

    const checkIfCnpjExists = await this.supplierRepository.findByCnpj(cnpj);
    if (checkIfCnpjExists) {
      throw new ConflictException('CNPJ already exists');
    }

    const supplier = await this.supplierRepository.create({
      name,
      cnpj,
      address,
      phoneNumber,
    });

    return { supplier };
  }
}
