import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  IDEMPOTENCY_CONFLICT_MESSAGE,
  IDEMPOTENCY_PROCESSING_STATUS,
} from './constants';
import { IdempotencyService } from './idempotency.service';

jest.mock('./hash-body', () => ({
  hashBody: jest.fn(() => 'body-hash'),
}));

import { hashBody } from './hash-body';

const hashBodyMock = hashBody as jest.MockedFunction<typeof hashBody>;

describe('IdempotencyService (INV-IDEM)', () => {
  const farmId = 'farm-id';
  const key = 'idem-key';
  const method = 'POST';
  const path = '/purchases';
  const body = { supplierId: 'supplier-id', amount: 100 };
  const bodyHash = 'body-hash';

  const findUnique = jest.fn();
  const create = jest.fn();
  const update = jest.fn();
  const deleteFn = jest.fn();

  const prisma = {
    idempotencyKey: {
      findUnique,
      create,
      update,
      delete: deleteFn,
    },
  } as unknown as PrismaService;

  const service = new IdempotencyService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    hashBodyMock.mockReturnValue(bodyHash);
  });

  it('executes handler and stores response on first request', async () => {
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue({});
    update.mockResolvedValue({});

    const response = {
      statusCode: 201,
      message: 'Purchase created successfully',
      result: { id: 'purchase-id' },
    };

    const execute = jest.fn().mockResolvedValue(response);

    const result = await service.resolveOrExecute({
      farmId,
      key,
      method,
      path,
      body,
      execute,
    });

    expect(result).toEqual(response);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: {
        farmId,
        key,
        method,
        path,
        bodyHash,
        statusCode: IDEMPOTENCY_PROCESSING_STATUS,
        responseJson: {},
      },
    });
    expect(update).toHaveBeenCalledWith({
      where: { farmId_key: { farmId, key } },
      data: {
        statusCode: 201,
        responseJson: response,
      },
    });
  });

  it('returns cached response when same key and body are replayed', async () => {
    const cached = {
      statusCode: 201,
      message: 'Purchase created successfully',
      result: { id: 'purchase-id' },
    };

    findUnique.mockResolvedValue({
      farmId,
      key,
      bodyHash,
      statusCode: 201,
      responseJson: cached,
    });

    const execute = jest.fn();

    const result = await service.resolveOrExecute({
      farmId,
      key,
      method,
      path,
      body,
      execute,
    });

    expect(result).toEqual(cached);
    expect(execute).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('throws IDEMPOTENCY_CONFLICT when key is reused with a different body', async () => {
    findUnique.mockResolvedValue({
      farmId,
      key,
      bodyHash: 'other-hash',
      statusCode: 201,
      responseJson: {},
    });

    const execute = jest.fn();

    await expect(
      service.resolveOrExecute({
        farmId,
        key,
        method,
        path,
        body,
        execute,
      }),
    ).rejects.toThrow(new ConflictException(IDEMPOTENCY_CONFLICT_MESSAGE));

    expect(execute).not.toHaveBeenCalled();
  });

  it('deletes claim when handler fails so the request can be retried', async () => {
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue({});
    deleteFn.mockResolvedValue({});

    const execute = jest.fn().mockRejectedValue(new Error('boom'));

    await expect(
      service.resolveOrExecute({
        farmId,
        key,
        method,
        path,
        body,
        execute,
      }),
    ).rejects.toThrow('boom');

    expect(deleteFn).toHaveBeenCalledWith({
      where: { farmId_key: { farmId, key } },
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('retries lookup after unique constraint race on create', async () => {
    const cached = {
      statusCode: 201,
      message: 'Purchase created successfully',
      result: { id: 'purchase-id' },
    };

    findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
      farmId,
      key,
      bodyHash,
      statusCode: 201,
      responseJson: cached,
    });

    create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002',
        clientVersion: '6.0.0',
      }),
    );

    const execute = jest.fn();

    const result = await service.resolveOrExecute({
      farmId,
      key,
      method,
      path,
      body,
      execute,
    });

    expect(result).toEqual(cached);
    expect(execute).not.toHaveBeenCalled();
  });
});
