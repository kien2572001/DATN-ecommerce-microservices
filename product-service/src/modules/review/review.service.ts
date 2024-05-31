import { Injectable } from '@nestjs/common';
import { ReviewRepository } from './repository/review.repository';
import { PaginateModel } from 'mongoose';
import { Review, ReviewSchema } from './repository/review.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    @InjectModel(Review.name)
    private readonly reviewModel: PaginateModel<Review>,
  ) {}

  async getReviewsByProductId(
    product_id: string,
    page: number,
    options = {
      newest: false,
      hasImages: false,
      rating: null,
    },
  ) {
    const query: any = { product_id };

    if (options.rating) {
      query.rating = options.rating;
    }

    if (options.hasImages) {
      query.images = { $ne: [] };
    }

    const paginateOptions = {
      page: page || 1,
      limit: 6,
      sort: options.newest ? { createdAt: -1 } : {},
    };

    return await this.reviewModel.paginate(query, paginateOptions);
  }

  async createReview(review: any) {
    return await this.reviewRepository.create(review);
  }
}
