import {
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SupplierRepository } from '../repositories/supplier.repository';
import { CreateSupplierService } from './create-supplier.service';

describe('CreateSupplierService', () => {
  const supplierRepository: jest.Mocked<
    Pick<SupplierRepository, 'create' | 'findByCnpj' | 'findByCpf'>
  > = {
    create: jest.fn(),
    findByCnpj: jest.fn(),
    findByCpf: jest.fn(),
  };

  const service = new CreateSupplierService(
    supplierRepository as unknown as SupplierRepository,
  );

  const baseInput = {
    name: 'Fornecedor Teste',
    organizationId: 'org-1',
    activeFarmId: 'farm-1',
  };

  const created = {
    id: 'sup-1',
    organizationId: 'org-1',
    farmId: null,
    name: 'Fornecedor Teste',
    cnpj: '11222333000181',
    cpf: null,
    address: null,
    city: null,
    state: null,
    phoneNumber: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    supplierRepository.findByCnpj.mockResolvedValue(null);
    supplierRepository.findByCpf.mockResolvedValue(null);
    supplierRepository.create.mockResolvedValue(created);
  });

  it('rejects when neither CNPJ nor CPF is provided', async () => {
    await expect(service.execute(baseInput)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(supplierRepository.create).not.toHaveBeenCalled();
  });

  it('rejects when both CNPJ and CPF are provided', async () => {
    await expect(
      service.execute({
        ...baseInput,
        cnpj: '11222333000181',
        cpf: '52998224725',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(supplierRepository.create).not.toHaveBeenCalled();
  });

  it('rejects invalid CNPJ check digits', async () => {
    await expect(
      service.execute({
        ...baseInput,
        cnpj: '11222333000180',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(supplierRepository.create).not.toHaveBeenCalled();
  });

  it('rejects invalid CPF check digits', async () => {
    await expect(
      service.execute({
        ...baseInput,
        cpf: '52998224724',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(supplierRepository.create).not.toHaveBeenCalled();
  });

  it('rejects duplicate CNPJ in the organization', async () => {
    supplierRepository.findByCnpj.mockResolvedValue(created);

    await expect(
      service.execute({
        ...baseInput,
        cnpj: '11222333000181',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(supplierRepository.create).not.toHaveBeenCalled();
  });

  it('rejects duplicate CPF in the organization', async () => {
    supplierRepository.findByCpf.mockResolvedValue({
      ...created,
      cnpj: null,
      cpf: '52998224725',
    });

    await expect(
      service.execute({
        ...baseInput,
        cpf: '52998224725',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(supplierRepository.create).not.toHaveBeenCalled();
  });

  it('creates a supplier with CNPJ', async () => {
    const result = await service.execute({
      ...baseInput,
      cnpj: '11222333000181',
      address: 'Rua A',
      city: 'Salvador',
      state: 'BA',
      phoneNumber: '71999999999',
    });

    expect(supplierRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Fornecedor Teste',
        cnpj: '11222333000181',
        cpf: null,
        address: 'Rua A',
        city: 'Salvador',
        state: 'BA',
        phoneNumber: '71999999999',
        organizationId: 'org-1',
      }),
    );
    expect(result.supplier).toEqual(created);
  });
});
