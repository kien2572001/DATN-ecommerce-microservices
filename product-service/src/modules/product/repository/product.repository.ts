import { Product } from './product.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseAbstractRepository } from '../../../base/base.abstract.repository';
import { InventoryService } from '../../inventory/inventory.service';

@Injectable()
export class ProductRepository extends BaseAbstractRepository<Product> {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {
    super(productModel);
  }

  async findOneByIdWithPopulate(
    id: string,
    populate: string[] = [],
  ): Promise<Product> {
    return this.productModel.findById(id).populate(populate.join(' ')).lean();
  }

  async findOneByIdWithFullPopulate(id: string): Promise<Product> {
    return this.productModel
      .findById(id)
      .populate('category')
      .populate('classifications')
      .lean();
  }

  async findOneBySlugWithFullPopulate(slug: string): Promise<Product> {
    return this.productModel
      .findOne({
        product_slug: slug,
      })
      .populate('category')
      .populate('classifications')
      .lean();
  }
}
