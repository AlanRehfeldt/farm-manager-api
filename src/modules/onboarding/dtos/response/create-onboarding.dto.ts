import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { OnboardingResultDto } from '../entity/onboarding-result.entity';

export class CreateOnboardingResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty({ default: 'Onboarding completed successfully' })
  message!: string;

  @ApiProperty({ type: OnboardingResultDto })
  result!: OnboardingResultDto;
}
