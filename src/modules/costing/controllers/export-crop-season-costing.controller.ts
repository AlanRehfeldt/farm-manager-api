import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { ExportCropSeasonCostingService } from '../services/export-crop-season-costing.service';

const paramSchema = z.object({ id: z.uuid() });

const querySchema = z.object({
  format: z.enum(['csv']),
});

@ApiTags('Costing')
@FarmScoped()
@Controller('/crop-seasons')
export class ExportCropSeasonCostingController {
  constructor(
    private readonly exportCropSeasonCostingService: ExportCropSeasonCostingService,
  ) {}

  @ApiOperation({ summary: 'Export crop season costing report' })
  @ApiQuery({
    name: 'format',
    required: true,
    enum: ['csv'],
    description: 'Export format',
  })
  @ApiProduces('text/csv')
  @ApiBadRequestResponse({
    description: 'Unsupported export format',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop season does not exist',
    type: NotFoundDto,
  })
  @Get(':id/costing/export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async export(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(paramSchema)) param: { id: string },
    @Query(new ZodValidationPipe(querySchema)) query: { format: 'csv' },
  ) {
    const { content, filename } =
      await this.exportCropSeasonCostingService.execute(
        param.id,
        farmId,
        query.format,
      );

    return new StreamableFile(Buffer.from(content, 'utf-8'), {
      type: 'text/csv; charset=utf-8',
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
