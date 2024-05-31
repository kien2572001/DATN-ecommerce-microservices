import { Module } from '@nestjs/common';
import { UtilitiesModule } from '../../utilities/utilities.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './repository/review.schema';
import { ReviewRepository } from './repository/review.repository';
import { ReviewService } from './review.service';
import { ReviewPrivateController } from './controllers/review.private.controller';

@Module({
  imports: [
    UtilitiesModule,
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
  ],
  controllers: [ReviewPrivateController],
  providers: [ReviewService, ReviewRepository],
  exports: [ReviewRepository],
})
export class ReviewModule {}
