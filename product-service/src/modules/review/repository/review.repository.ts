import { Review } from './review.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseAbstractRepository } from '../../../base/base.abstract.repository';

@Injectable()
export class ReviewRepository extends BaseAbstractRepository<Review> {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
  ) {
    super(reviewModel);
  }

  async findByProductId(product_id: string): Promise<Review[]> {
    return this.reviewModel.find({ product_id }).exec();
  }
}
