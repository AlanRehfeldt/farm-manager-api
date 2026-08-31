import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { CreateActivityBodyDto } from '../dtos/request/activity.dto';
import { CreateActivityResponseDto } from '../dtos/response/activity-response.dto';
import { CreateActivityService } from '../services/create-activity.service';

const activityTypeSchema = z.enum([
  'PREPARATION',
  'FERTILIZATION',
  'PHYTOSANITARY',
  'IRRIGATION',
  'MANAGEMENT',
  'HARVEST',
  'OTHER',
]);

const payBasisSchema = z.enum(['HOUR', 'DAY', 'OUTPUT']);

const positiveDecimalString = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
    message: 'Value must be greater than zero',
  });

const laborLineSchema = z
  .object({
    employeeId: z.uuid().optional(),
    contractorName: z.string().min(1).optional(),
    payBasis: payBasisSchema,
    hours: z.string().optional(),
    days: z.string().optional(),
    outputQty: z.string().optional(),
    costInCents: z.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    const hasEmployee = Boolean(data.employeeId);
    const hasContractor = Boolean(data.contractorName);

    if (hasEmployee === hasContractor) {
      ctx.addIssue({
        code: 'custom',
        message: 'Exactly one of employeeId or contractorName is required',
      });
    }

    if (data.payBasis === 'HOUR' && !data.hours) {
      ctx.addIssue({
        code: 'custom',
        message: 'hours is required for HOUR pay basis',
        path: ['hours'],
      });
    }
    if (data.payBasis === 'DAY' && !data.days) {
      ctx.addIssue({
        code: 'custom',
        message: 'days is required for DAY pay basis',
        path: ['days'],
      });
    }
    if (data.payBasis === 'OUTPUT' && !data.outputQty) {
      ctx.addIssue({
        code: 'custom',
        message: 'outputQty is required for OUTPUT pay basis',
        path: ['outputQty'],
      });
    }
  });

const createActivityBodySchema = z.object({
  cropSeasonId: z.uuid(),
  fieldId: z.uuid(),
  activityType: activityTypeSchema,
  date: z.coerce.date(),
  note: z.string().optional(),
  inputs: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: positiveDecimalString,
      }),
    )
    .default([]),
  labor: z.array(laborLineSchema).default([]),
  machineHours: z
    .array(
      z.object({
        machineId: z.uuid(),
        hours: positiveDecimalString,
      }),
    )
    .default([]),
});

@ApiTags('Activity')
@FarmScoped()
@Controller('/activities')
export class CreateActivityController {
  constructor(private readonly createActivityService: CreateActivityService) {}

  @ApiOperation({ summary: 'Create activity with stock OUT' })
  @ApiCreatedResponse({
    description: 'Activity created successfully',
    type: CreateActivityResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop season, field or product does not exist',
    type: NotFoundDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Crop season is not active or insufficient stock',
  })
  @Post()
  async create(
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @CurrentUser() user: { userId: string },
    @Body(new ZodValidationPipe(createActivityBodySchema))
    data: CreateActivityBodyDto,
  ) {
    const { activity } = await this.createActivityService.execute({
      ...data,
      organizationId,
      farmId,
      createdByUserId: user.userId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Activity created successfully',
      result: activity,
    };
  }
}
