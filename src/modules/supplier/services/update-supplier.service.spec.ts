import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { SupplierRepository } from '../repositories/supplier.repository';
import { UpdateSupplierService } from './update-supplier.service';

describe('UpdateSupplierService', () => {
  const supplierRepository: jest.Mocked<
    Pick<
      SupplierRepository,
      'findById' | 'findByCnpj' | 'findByCpf' | 'update'
    >
  > = {
    findById: jest.fn(),
    findByCnpj: jest.fn(),
    findByCpf: jest.fn(),
    update: jest.fn(),
  };

  const service = new UpdateSupplierService(
    supplierRepository as unknown as SupplierRepository,
  );

  const existing = {
    id: 'sup-1',
    organizationId: 'org-1',
    farmId: null,
    name: 'Fornecedor Teste',
    cnpj: '11222333000181',
    cpf: null as string | null,
    address: 'Rua A',
    city: 'Salvador',
    state: 'BA',
    phoneNumber: '71999999999',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    supplierRepository.findById.mockResolvedValue(existing);
    supplierRepository.findByCnpj.mockResolvedValue(null);
    supplierRepository.findByCpf.mockResolvedValue(null);
    supplierRepository.update.mockResolvedValue(existing);
  });

  it('throws when supplier does not exist', async () => {
    supplierRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute('org-1', 'farm-1', { id: 'sup-1', name: 'Novo' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects clearing both documents', async () => {
    await expect(
      service.execute('org-1', 'farm-1', {
        id: 'sup-1',
        cnpj: null,
        cpf: null,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(supplierRepository.update).not.toHaveBeenCalled();
  });

  it('rejects providing both documents', async () => {
    await expect(
      service.execute('org-1', 'farm-1', {
        id: 'sup-1',
        cnpj: '11222333000181',
        cpf: '52998224725',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(supplierRepository.update).not.toHaveBeenCalled();
  });

  it('rejects invalid CNPJ check digits', async () => {
    await expect(
      service.execute('org-1', 'farm-1', {
        id: 'sup-1',
        cnpj: '11222333000180',
        cpf: null,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(supplierRepository.update).not.toHaveBeenCalled();
  });

  it('rejects invalid CPF check digits', async () => {
    await expect(
      service.execute('org-1', 'farm-1', {
        id: 'sup-1',
        cnpj: null,
        cpf: '52998224724',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(supplierRepository.update).not.toHaveBeenCalled();
  });

  it('rejects duplicate CNPJ in the organization', async () => {
    supplierRepository.findByCnpj.mockResolvedValue({
      ...existing,
      id: 'sup-2',
    });

    await expect(
      service.execute('org-1', 'farm-1', {
        id: 'sup-1',
        cnpj: '11222333000181',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(supplierRepository.update).not.toHaveBeenCalled();
  });

  it('rejects duplicate CPF in the organization', async () => {
    supplierRepository.findByCpf.mockResolvedValue({
      ...existing,
      id: 'sup-2',
      cnpj: null,
      cpf: '52998224725',
    });

    await expect(
      service.execute('org-1', 'farm-1', {
        id: 'sup-1',
        cnpj: null,
        cpf: '52998224725',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(supplierRepository.update).not.toHaveBeenCalled();
  });

  it('switches from CNPJ to CPF and clears the previous document', async () => {
    const updated = {
      ...existing,
      cnpj: null,
      cpf: '52998224725',
    };
    supplierRepository.update.mockResolvedValue(updated);

    const result = await service.execute('org-1', 'farm-1', {
      id: 'sup-1',
      cnpj: null,
      cpf: '52998224725',
    });

    expect(supplierRepository.update).toHaveBeenCalledWith({
      id: 'sup-1',
      name: undefined,
      cnpj: null,
      cpf: '52998224725',
      address: undefined,
      city: undefined,
      state: undefined,
      phoneNumber: undefined,
    });
    expect(result.supplier).toEqual(updated);
  });

  it('persists null when clearing optional contact fields', async () => {
    const cleared = {
      ...existing,
      address: null,
      city: null,
      state: null,
      phoneNumber: null,
    };
    supplierRepository.update.mockResolvedValue(cleared);

    const result = await service.execute('org-1', 'farm-1', {
      id: 'sup-1',
      address: null,
      city: null,
      state: null,
      phoneNumber: null,
    });

    expect(supplierRepository.update).toHaveBeenCalledWith({
      id: 'sup-1',
      name: undefined,
      cnpj: '11222333000181',
      cpf: null,
      address: null,
      city: null,
      state: null,
      phoneNumber: null,
    });
    expect(result.supplier).toEqual(cleared);
  });
});
