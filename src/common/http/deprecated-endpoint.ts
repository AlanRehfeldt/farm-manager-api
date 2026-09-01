import { GoneException } from '@nestjs/common';

export function throwDeprecatedWriteEndpoint(resource: string): never {
  throw new GoneException(
    `${resource} write endpoints are deprecated. Use /purchases or /expenses instead.`,
  );
}
