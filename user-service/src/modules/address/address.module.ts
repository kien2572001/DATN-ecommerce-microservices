import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { HttpModule } from '@nestjs/axios';
import { UtilitiesModule } from 'src/utilities/utilities.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressEntity, AddressSchema } from './address.entity';
@Module({
  imports: [
    HttpModule,
    UtilitiesModule,
    MongooseModule.forFeature([
      { name: AddressEntity.name, schema: AddressSchema },
    ]),
  ],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
