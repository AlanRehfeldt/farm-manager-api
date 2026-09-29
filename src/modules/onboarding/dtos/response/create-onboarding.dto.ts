import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { OnboardingResultDto } from '../entity/onboarding-result.entity';

export class CreateOnboardingResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty({ default: 'First farm created successfully' })
  message!: string;

  @ApiProperty({ type: OnboardingResultDto })
  result!: OnboardingResultDto;
}
