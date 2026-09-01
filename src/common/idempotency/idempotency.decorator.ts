import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { IDEMPOTENT_METADATA_KEY, IDEMPOTENCY_KEY_HEADER } from './constants';

export function Idempotent() {
  return applyDecorators(
    SetMetadata(IDEMPOTENT_METADATA_KEY, true),
    ApiHeader({
      name: 'Idempotency-Key',
      required: false,
      description:
        'Client-generated key for safe retries. Same key and body returns the original response.',
    }),
  );
}

export { IDEMPOTENCY_KEY_HEADER };
