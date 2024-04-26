import {Module} from "@nestjs/common";
import {TypeOrmModule} from '@nestjs/typeorm';
import {ReactionEntity} from "./repository/reaction.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ReactionEntity])],
})
export class ReactionModule {
  
}