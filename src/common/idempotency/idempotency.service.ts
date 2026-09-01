import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  IDEMPOTENCY_CONFLICT_MESSAGE,
  IDEMPOTENCY_PROCESSING_STATUS,
} from './constants';
import { hashBody } from './hash-body';

type ResolveParams<T> = {
  farmId: string;
  key: string;
  method: string;
  path: string;
  body: unknown;
  execute: () => Promise<T>;
};

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveOrExecute<T>(params: ResolveParams<T>): Promise<T> {
    const bodyHash = hashBody(params.body);
    const existing = await this.prisma.idempotencyKey.findUnique({
      where: {
        farmId_key: {
          farmId: params.farmId,
          key: params.key,
        },
      },
    });

    if (existing) {
      if (existing.bodyHash !== bodyHash) {
        throw new ConflictException(IDEMPOTENCY_CONFLICT_MESSAGE);
      }

      if (existing.statusCode !== IDEMPOTENCY_PROCESSING_STATUS) {
        return existing.responseJson as T;
      }

      const completed = await this.waitForCompletion(params.farmId, params.key);
      if (completed) {
        return completed.responseJson as T;
      }

      throw new ConflictException(IDEMPOTENCY_CONFLICT_MESSAGE);
    }

    try {
      await this.prisma.idempotencyKey.create({
        data: {
          farmId: params.farmId,
          key: params.key,
          method: params.method,
          path: params.path,
          bodyHash,
          statusCode: IDEMPOTENCY_PROCESSING_STATUS,
          responseJson: {},
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return this.resolveOrExecute(params);
      }

      throw error;
    }

    try {
      const response = await params.execute();
      const statusCode =
        typeof response === 'object' &&
        response !== null &&
        'statusCode' in response &&
        typeof (response as { statusCode: unknown }).statusCode === 'number'
          ? (response as { statusCode: number }).statusCode
          : 201;

      await this.prisma.idempotencyKey.update({
        where: {
          farmId_key: {
            farmId: params.farmId,
            key: params.key,
          },
        },
        data: {
          statusCode,
          responseJson: response as Prisma.InputJsonValue,
        },
      });

      return response;
    } catch (error) {
      await this.prisma.idempotencyKey
        .delete({
          where: {
            farmId_key: {
              farmId: params.farmId,
              key: params.key,
            },
          },
        })
        .catch(() => undefined);

      throw error;
    }
  }

  private async waitForCompletion(farmId: string, key: string) {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await sleep(100);

      const record = await this.prisma.idempotencyKey.findUnique({
        where: {
          farmId_key: {
            farmId,
            key,
          },
        },
      });

      if (!record) {
        return null;
      }

      if (record.statusCode !== IDEMPOTENCY_PROCESSING_STATUS) {
        return record;
      }
    }

    return null;
  }
}
