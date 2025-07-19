import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PrismaEmployeeRepository } from './repositories/prisma-employee.repository';
import { EMPLOYEE_REPOSITORY } from './repositories/employee.repository';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [
    {
      provide: EMPLOYEE_REPOSITORY,
      useClass: PrismaEmployeeRepository,
    },
  ],
  exports: [EMPLOYEE_REPOSITORY],
})
export class EmployeeModule {}
