import { BadRequestException, Injectable } from '@nestjs/common';
import {
  buildCostingExportFilename,
  formatSeasonCostingCsv,
} from '../domain/format-season-costing-csv';
import { GetCropSeasonCostingService } from './get-crop-season-costing.service';

export type CostingExportFormat = 'csv';

export type ExportCropSeasonCostingResult = {
  content: string;
  filename: string;
  contentType: string;
};

@Injectable()
export class ExportCropSeasonCostingService {
  constructor(
    private readonly getCropSeasonCostingService: GetCropSeasonCostingService,
  ) {}

  async execute(
    cropSeasonId: string,
    farmId: string,
    format: string,
  ): Promise<ExportCropSeasonCostingResult> {
    if (format !== 'csv') {
      throw new BadRequestException(
        'Unsupported export format. Only format=csv is supported.',
      );
    }

    const { costing } = await this.getCropSeasonCostingService.execute(
      cropSeasonId,
      farmId,
    );

    return {
      content: formatSeasonCostingCsv(costing),
      filename: buildCostingExportFilename(cropSeasonId),
      contentType: 'text/csv; charset=utf-8',
    };
  }
}
