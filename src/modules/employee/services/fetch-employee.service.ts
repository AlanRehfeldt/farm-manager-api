import { Inject, Injectable } from '@nestjs/common';
import { SearchManyQuery, toEmployeeResponse } from '../repositories/@types';
import {
  EMPLOYEE_REPOSITORY,
  EmployeeRepository,
} from '../repositories/employee.repository';

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
      results: employees.map(toEmployeeResponse),
      total,
      page: params.page,
      perPage: params.perPage,
      orderBy: params.orderBy,
      orderDirection: params.orderDirection,
    };
  }
}
