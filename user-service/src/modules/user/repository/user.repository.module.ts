import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepository } from './user.repository';
import { UserSchema, UserEntity } from './user.entity';

@Module({
  providers: [UserRepository],
  exports: [UserRepository],
  imports: [
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
  ],
})
export class UserRepositoryModule {}
