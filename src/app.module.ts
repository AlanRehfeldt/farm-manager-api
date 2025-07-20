import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env';
import { EmployeeModule } from './modules/employee/employee.module';
import { SupplierModule } from './modules/supplier/supplier.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    EmployeeModule,
    SupplierModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
