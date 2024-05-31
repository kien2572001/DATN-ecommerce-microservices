import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Request,
  Query,
} from '@nestjs/common';
import { ReviewService } from '../review.service';
import { ResponseHandler } from '../../../utilities/response.handler';
import { HttpStatus } from '@nestjs/common';
import { CreateReviewDto } from '../dtos/review.create.dto';
@Controller({
  path: '/private/review',
})
export class ReviewPrivateController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly responseHandler: ResponseHandler,
  ) {}

  @Get('/product/:product_id')
  async getReviewsByProductId(
    @Param('product_id') product_id: string,
    @Query('page') page: number = 1,
    @Query('newest') newest: boolean = false,
    @Query('hasImages') hasImages: boolean = false,
    @Query('rating') rating: number = null,
  ) {
    const reviews = await this.reviewService.getReviewsByProductId(
      product_id,
      page,
      { newest, hasImages, rating },
    );
    return this.responseHandler.createSuccessResponse(
      reviews,
      'Reviews found successfully',
      HttpStatus.OK,
    );
  }

  @Post('/')
  async createReview(@Body() review: CreateReviewDto) {
    const createdReview = await this.reviewService.createReview(review);
    return this.responseHandler.createSuccessResponse(
      createdReview,
      'Review created successfully',
      HttpStatus.CREATED,
    );
  }
}
