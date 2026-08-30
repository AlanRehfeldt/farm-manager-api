import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class CloseCropSeasonService {
  async execute() {
    throw new HttpException(
      'Close crop season is not implemented yet (PR-13)',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
