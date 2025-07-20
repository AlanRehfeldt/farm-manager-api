import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PrismaEmployeeRepository } from './repositories/prisma-employee.repository';
import { EMPLOYEE_REPOSITORY } from './repositories/employee.repository';
import { CreateEmployeeController } from './controllers/create-employee.controller';
import { CreateEmployeeService } from './services/create-employee.service';
import { UpdateEmployeeController } from './controllers/update-employee.controller';
import { DeleteEmployeeController } from './controllers/delete-employee.controller';
import { GetEmployeeController } from './controllers/get-employee.controller';
import { FetchEmployeesController } from './controllers/fetch-employee.controller';
import { UpdateEmployeeService } from './services/update-employee.service';
import { DeleteEmployeeService } from './services/delete-employee.service';
import { GetEmployeeService } from './services/get-employee.service';
import { FetchEmployeesService } from './services/fetch-employee.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateEmployeeController,
    UpdateEmployeeController,
    DeleteEmployeeController,
    GetEmployeeController,
    FetchEmployeesController,
  ],
  providers: [
    {
      provide: EMPLOYEE_REPOSITORY,
      useClass: PrismaEmployeeRepository,
    },
    CreateEmployeeService,
    UpdateEmployeeService,
    DeleteEmployeeService,
    GetEmployeeService,
    FetchEmployeesService,
  ],
  exports: [EMPLOYEE_REPOSITORY],
})
export class EmployeeModule {}
