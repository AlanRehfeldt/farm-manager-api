import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DomainConflictCode,
  domainConflict,
} from 'src/common/errors/domain-conflict';
import {
  ActivityType,
  CropSeasonStatus,
  EmploymentType,
  LaborPayBasis,
} from '@prisma/client';
import { computeHourlyAmountInCents } from '../domain/hourly-cost';
import {
  COST_CATEGORY_REPOSITORY,
  CostCategoryRepository,
} from 'src/modules/cost-category/repositories/cost-category.repository';
import {
  CROP_PLANTING_REPOSITORY,
  CropPlantingRepository,
} from 'src/modules/crop-season/repositories/crop-planting.repository';
import {
  CROP_SEASON_REPOSITORY,
  CropSeasonRepository,
} from 'src/modules/crop-season/repositories/crop-season.repository';
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from 'src/modules/employee/repositories/employee.repository';
import {
  FIELD_REPOSITORY,
  FieldRepository,
} from 'src/modules/field/repositories/field.repository';
import {
  MACHINE_REPOSITORY,
  MachineRepository,
} from 'src/modules/machine/repositories/machine.repository';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from 'src/modules/product/repositories/product.repository';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from 'src/modules/unit-of-measurement/repositories/unit-of-measurement.repository';
import { toCreateActivityResponse } from '../mappers/activity.mapper';
import {
  ACTIVITY_REPOSITORY,
  ActivityRepository,
} from '../repositories/activity.repository';

type CreateActivityInputItem = {
  productId: string;
  quantity: string;
};

type CreateActivityLaborItem = {
  employeeId?: string;
  contractorName?: string;
  payBasis: LaborPayBasis;
  hours?: string;
  days?: string;
  outputQty?: string;
  hourlyRateInCents?: number;
  costInCents?: number;
};

type CreateActivityMachineHourItem = {
  machineId: string;
  hours: string;
};

type CreateActivityInput = {
  farmId: string;
  organizationId: string;
  cropSeasonId: string;
  fieldId: string;
  activityType: ActivityType;
  date: Date;
  note?: string | null;
  createdByUserId: string;
  inputs: CreateActivityInputItem[];
  labor: CreateActivityLaborItem[];
  machineHours: CreateActivityMachineHourItem[];
};

@Injectable()
export class CreateActivityService {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: ActivityRepository,
    @Inject(CROP_SEASON_REPOSITORY)
    private readonly cropSeasonRepository: CropSeasonRepository,
    @Inject(CROP_PLANTING_REPOSITORY)
    private readonly cropPlantingRepository: CropPlantingRepository,
    @Inject(FIELD_REPOSITORY)
    private readonly fieldRepository: FieldRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
    @Inject(COST_CATEGORY_REPOSITORY)
    private readonly costCategoryRepository: CostCategoryRepository,
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
    @Inject(MACHINE_REPOSITORY)
    private readonly machineRepository: MachineRepository,
  ) {}

  async execute(input: CreateActivityInput) {
    const cropSeason = await this.cropSeasonRepository.findById(
      input.cropSeasonId,
      input.farmId,
    );
    if (!cropSeason) {
      throw new NotFoundException('Crop season not found');
    }

    if (cropSeason.status !== CropSeasonStatus.ACTIVE) {
      throw new ConflictException('Activities require an active crop season');
    }

    const field = await this.fieldRepository.findById(
      input.fieldId,
      input.farmId,
    );
    if (!field) {
      throw new NotFoundException('Field not found');
    }

    const planting = await this.cropPlantingRepository.findBySeasonAndField(
      input.cropSeasonId,
      input.fieldId,
    );
    if (!planting) {
      throw new BadRequestException('Field is not planted in this crop season');
    }

    const [moFixa, moTemporaria, maquina] = await Promise.all([
      this.costCategoryRepository.findByCode(input.organizationId, 'MO_fixa'),
      this.costCategoryRepository.findByCode(
        input.organizationId,
        'MO_temporaria',
      ),
      this.costCategoryRepository.findByCode(input.organizationId, 'maquina'),
    ]);

    if (!moFixa || !moTemporaria || !maquina) {
      throw new BadRequestException(
        'Required cost categories not found for organization',
      );
    }

    const productMeta: Record<
      string,
      {
        name: string;
        uomAcronym: string;
        uomId: string;
        costCategoryId: string;
        costCategoryCode: string;
      }
    > = {};

    for (const item of input.inputs) {
      const quantity = Number(item.quantity);
      if (Number.isNaN(quantity) || quantity <= 0) {
        throw new BadRequestException(
          'Input quantity must be greater than zero',
        );
      }

      const product = await this.productRepository.findById(
        item.productId,
        input.organizationId,
        input.farmId,
      );
      if (!product) {
        throw new NotFoundException(`Product not found: ${item.productId}`);
      }

      const uom = await this.unitOfMeasurementRepository.findById(
        product.unitOfMeasurementId,
        input.organizationId,
      );
      if (!uom) {
        throw new BadRequestException(
          `Unit of measurement not found for product ${product.name}`,
        );
      }

      const costCategory = await this.costCategoryRepository.findById(
        product.costCategoryId,
        input.organizationId,
      );
      if (!costCategory) {
        throw new BadRequestException(
          `Cost category not found for product ${product.name}`,
        );
      }

      productMeta[item.productId] = {
        name: product.name,
        uomAcronym: uom.acronym,
        uomId: uom.id,
        costCategoryId: costCategory.id,
        costCategoryCode: costCategory.code,
      };
    }

    const employeeMeta: Record<
      string,
      { name: string; employmentType: 'CLT' | 'CONTRACTOR' }
    > = {};

    const year = input.date.getUTCFullYear();
    const month = input.date.getUTCMonth() + 1;

    const resolvedLabor: CreateActivityLaborItem[] = [];

    for (const item of input.labor) {
      const hasEmployee = Boolean(item.employeeId);
      const hasContractor = Boolean(item.contractorName?.trim());

      if (hasEmployee === hasContractor) {
        throw new BadRequestException(
          'Labor line requires exactly one of employeeId or contractorName',
        );
      }

      if (item.payBasis === LaborPayBasis.HOUR) {
        if (!item.hours || Number(item.hours) <= 0) {
          throw new BadRequestException(
            'Hours must be greater than zero for HOUR pay basis',
          );
        }
      } else if (item.payBasis === LaborPayBasis.DAY) {
        if (!item.days || Number(item.days) <= 0) {
          throw new BadRequestException(
            'Days must be greater than zero for DAY pay basis',
          );
        }
      } else if (item.payBasis === LaborPayBasis.OUTPUT) {
        if (!item.outputQty || Number(item.outputQty) <= 0) {
          throw new BadRequestException(
            'Output quantity must be greater than zero for OUTPUT pay basis',
          );
        }
      }

      if (item.employeeId) {
        const employee = await this.employeeRepository.findById(
          item.employeeId,
          input.organizationId,
          input.farmId,
        );
        if (!employee) {
          throw new NotFoundException(`Employee not found: ${item.employeeId}`);
        }
        employeeMeta[item.employeeId] = {
          name: employee.name,
          employmentType: employee.employmentType,
        };

        if (employee.employmentType === EmploymentType.CLT) {
          if (item.payBasis !== LaborPayBasis.HOUR) {
            throw new BadRequestException(
              'CLT labor must use HOUR pay basis',
            );
          }
          if (item.costInCents != null || item.hourlyRateInCents != null) {
            throw new BadRequestException(
              'CLT labor must not include costInCents or hourlyRateInCents',
            );
          }
          if (
            employee.monthlySalaryInCents == null ||
            employee.monthlySalaryInCents <= 0n
          ) {
            throw new BadRequestException(
              'CLT employee requires monthlySalaryInCents before pointing hours',
            );
          }

          const monthClosed =
            await this.activityRepository.hasLaborMonthClosing(
              item.employeeId,
              year,
              month,
            );
          if (monthClosed) {
            throw new ConflictException(
              'Cannot point CLT hours: labor month is already closed',
            );
          }

          const hasSalaryAllocation =
            await this.activityRepository.hasSalaryAllocationInOrgMonth(
              item.employeeId,
              input.organizationId,
              year,
              month,
            );
          if (hasSalaryAllocation) {
            throw domainConflict(
              DomainConflictCode.DOUBLE_COUNT_BLOCKED,
              'Activity labor blocked: employee already has salary allocated in this month',
            );
          }

          resolvedLabor.push({
            employeeId: item.employeeId,
            payBasis: LaborPayBasis.HOUR,
            hours: item.hours,
          });
          continue;
        }

        // CONTRACTOR employee
        const hasSalaryAllocation =
          await this.activityRepository.hasSalaryAllocationInOrgMonth(
            item.employeeId,
            input.organizationId,
            year,
            month,
          );
        if (hasSalaryAllocation) {
          throw domainConflict(
            DomainConflictCode.DOUBLE_COUNT_BLOCKED,
            'Activity labor blocked: employee already has salary allocated in this month',
          );
        }
      }

      // CONTRACTOR employee or free-text contractor
      if (item.payBasis === LaborPayBasis.HOUR) {
        if (item.hourlyRateInCents == null || item.hourlyRateInCents <= 0) {
          throw new BadRequestException(
            'CONTRACTOR HOUR labor requires hourlyRateInCents',
          );
        }
        const costInCents = Number(
          computeHourlyAmountInCents(
            item.hours!,
            BigInt(item.hourlyRateInCents),
          ),
        );
        if (costInCents <= 0) {
          throw new BadRequestException('Labor cost must be greater than zero');
        }
        resolvedLabor.push({
          employeeId: item.employeeId,
          contractorName: item.contractorName,
          payBasis: item.payBasis,
          hours: item.hours,
          hourlyRateInCents: item.hourlyRateInCents,
          costInCents,
        });
      } else {
        if (item.costInCents == null || item.costInCents <= 0) {
          throw new BadRequestException(
            'Labor cost must be greater than zero for DAY/OUTPUT',
          );
        }
        resolvedLabor.push(item);
      }
    }

    const machineMeta: Record<
      string,
      {
        name: string;
        hourlyCostInCents: bigint;
        fuelIncludedInHourlyCost: boolean;
      }
    > = {};

    for (const item of input.machineHours) {
      const hours = Number(item.hours);
      if (Number.isNaN(hours) || hours <= 0) {
        throw new BadRequestException(
          'Machine hours must be greater than zero',
        );
      }

      const machine = await this.machineRepository.findById(
        item.machineId,
        input.farmId,
      );
      if (!machine) {
        throw new NotFoundException(`Machine not found: ${item.machineId}`);
      }
      if (!machine.active) {
        throw new BadRequestException(`Machine is inactive: ${machine.name}`);
      }

      machineMeta[item.machineId] = {
        name: machine.name,
        hourlyCostInCents: machine.hourlyCostInCents,
        fuelIncludedInHourlyCost: machine.fuelIncludedInHourlyCost,
      };
    }

    const hasFuelIncludedMachine = input.machineHours.some(
      (item) => machineMeta[item.machineId].fuelIncludedInHourlyCost,
    );
    const hasFuelInput = input.inputs.some(
      (item) => productMeta[item.productId].costCategoryCode === 'combustivel',
    );

    if (hasFuelIncludedMachine && hasFuelInput) {
      throw domainConflict(
        DomainConflictCode.DOUBLE_COUNT_BLOCKED,
        'Fuel input blocked: machine hourly cost already includes fuel',
      );
    }

    const { activity, stockEffects } = await this.activityRepository.create({
      farmId: input.farmId,
      cropSeasonId: input.cropSeasonId,
      fieldId: input.fieldId,
      activityType: input.activityType,
      date: input.date,
      note: input.note,
      createdByUserId: input.createdByUserId,
      inputs: input.inputs,
      labor: resolvedLabor,
      machineHours: input.machineHours,
      productMeta,
      machineMeta,
      employeeMeta,
      costCategoryIds: {
        moFixa: moFixa.id,
        moTemporaria: moTemporaria.id,
        maquina: maquina.id,
      },
    });

    return {
      activity: toCreateActivityResponse(activity, stockEffects),
    };
  }
}
