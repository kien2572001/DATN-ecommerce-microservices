import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateProductCommand } from '../impl/update-product.command';
import { ProductRepository } from '../../repository/product.repository';
import { CategoryRepository } from '../../../category/repository/category.repository';
import { ClassificationRepository } from '../../repository/classification.repository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InventoryService } from '../../../inventory/inventory.service';
import { CreateInventoryDto } from '../../../inventory/dtos/inventory.create.dto';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler
  implements ICommandHandler<UpdateProductCommand>
{
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async execute(command: UpdateProductCommand) {
    const { product, shop_id } = command;
    const category = await this.categoryRepository.findOneById(
      product.category_id,
    );
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    const timestamp = new Date().getTime();
    let updateProduct = await this.productRepository.findOneById(product._id);

    if (!updateProduct) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    const response = await this.inventoryService.updateInventoriesByProductId(
      product._id,
      product.is_has_many_classifications
        ? product.inventories
        : product.inventory,
      updateProduct.classifications,
      product.classifications,
    );
    console.log(response);

    updateProduct.product_name = product.product_name;
    updateProduct.product_slug = slugify(
      product.product_name + '-' + timestamp,
    );
    updateProduct.product_description = product.product_description;
    updateProduct.status = product.status;
    updateProduct.product_variants = product.product_variants;
    updateProduct.category = category;
    updateProduct.shop_id = shop_id;
    updateProduct.shipping_information = product.shipping_information;
    updateProduct.is_has_many_classifications =
      product.is_has_many_classifications;

    updateProduct = await this.productRepository.update(
      product._id,
      updateProduct,
    );

    return updateProduct;
  }
}
