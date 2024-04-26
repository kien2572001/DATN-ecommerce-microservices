import {Module} from "@nestjs/common";
import {TypeOrmModule} from '@nestjs/typeorm';
import {ProductEntity} from './repository/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
})

export class ProductModule {
}
