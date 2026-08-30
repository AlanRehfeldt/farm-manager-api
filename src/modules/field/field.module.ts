import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CreateFieldController } from './controllers/create-field.controller';
import { DeleteFieldController } from './controllers/delete-field.controller';
import { FetchFieldsController } from './controllers/fetch-fields.controller';
import { GetFieldController } from './controllers/get-field.controller';
import { UpdateFieldController } from './controllers/update-field.controller';
import { PrismaFieldRepository } from './repositories/prisma-field.repository';
import { FIELD_REPOSITORY } from './repositories/field.repository';
import { CreateFieldService } from './services/create-field.service';
import { DeleteFieldService } from './services/delete-field.service';
import { FetchFieldsService } from './services/fetch-fields.service';
import { GetFieldService } from './services/get-field.service';
import { UpdateFieldService } from './services/update-field.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CreateFieldController,
    GetFieldController,
    FetchFieldsController,
    UpdateFieldController,
    DeleteFieldController,
  ],
  providers: [
    { provide: FIELD_REPOSITORY, useClass: PrismaFieldRepository },
    CreateFieldService,
    GetFieldService,
    FetchFieldsService,
    UpdateFieldService,
    DeleteFieldService,
  ],
  exports: [FIELD_REPOSITORY],
})
export class FieldModule {}
