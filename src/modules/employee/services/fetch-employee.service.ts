import { Inject, Injectable } from '@nestjs/common';
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from '../repositories/employee.repository';
import { SearchManyQuery } from '../repositories/@types';

@Injectable()
export class FetchEmployeesService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute(params: SearchManyQuery) {
    const employees = await this.employeeRepository.searchMany(params);
    const total = await this.employeeRepository.count(params);

    return {
      results: employees,
      total,
      page: params.page,
      perPage: params.perPage,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };
  }
}
