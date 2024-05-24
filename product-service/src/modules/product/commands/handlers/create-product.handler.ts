import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProductCommand } from '../impl/create-product.command';
import { ProductRepository } from '../../repository/product.repository';
import { FileService } from '../../../../utilities/file.service';
import { CategoryRepository } from '../../../category/repository/category.repository';
import { ClassificationRepository } from '../../repository/classification.repository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Types } from 'mongoose';
import { InventoryService } from '../../../inventory/inventory.service';
import { CreateInventoryDto } from '../../../inventory/dtos/inventory.create.dto';
import slugify from 'slugify';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand>
{
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly fileService: FileService,
    private readonly categoryRepository: CategoryRepository,
    private readonly classificationRepository: ClassificationRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async execute(command: CreateProductCommand) {
    const { product, shop_id } = command;
    // const productImages = product.files
    //   ? await this.fileService.uploadFiles(product.files)
    //   : [];

    const category = await this.categoryRepository.findOneById(
      product.category_id,
    );
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    const timestamp = new Date().getTime();
    let newProduct = await this.productRepository.create({
      product_name: product.product_name,
      product_slug: slugify(product.product_name + '-' + timestamp),
      product_description: product.product_description,
      status: product.status,
      product_variants: product.product_variants,
      category: category,
      shop_id: shop_id,
      shipping_information: product.shipping_information,
    });

    for (const classification of product.classifications) {
      const classificationItems = [];
      for (const item of classification.items) {
        const newItem = {
          _id: new Types.ObjectId(),
          item_name: item,
        };
        classificationItems.push(newItem);
      }
      const newClassification = await this.classificationRepository.create({
        classification_name: classification.classification_name,
        items: classificationItems,
        product: newProduct._id,
      });
      newProduct.classifications.push(
        new Types.ObjectId(newClassification._id),
      );
    }

    await this.productRepository.update(newProduct._id, newProduct);
    let returnProduct = await this.productRepository.findOneByIdWithPopulate(
      newProduct._id,
      ['category', 'classifications'],
    );
    let classifications = returnProduct.classifications;
    let inventories = product.inventories;
    inventories = inventories.map((inventory) => {
      inventory.product_id = returnProduct._id;
      inventory.classification_main_id = this.searchItemNameToId(
        classifications,
        inventory.classification_main_id,
      );
      inventory.classification_sub_id = this.searchItemNameToId(
        classifications,
        inventory.classification_sub_id,
      );
      return inventory;
    });
    let createdInventories =
      await this.inventoryService.createManyInventories(inventories);
    // @ts-ignore
    returnProduct.inventories = createdInventories;
    return returnProduct;
  }

  private searchItemNameToId(classifications: any[], name: string) {
    for (const classification of classifications) {
      for (const item of classification.items) {
        if (item.item_name === name) {
          return item._id;
        }
      }
    }
    return null;
  }
}
