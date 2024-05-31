import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProductCommand } from '../impl/create-product.command';
import { ProductRepository } from '../../repository/product.repository';
import { CategoryRepository } from '../../../category/repository/category.repository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InventoryService } from '../../../inventory/inventory.service';
import { CreateInventoryDto } from '../../../inventory/dtos/inventory.create.dto';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler
  implements ICommandHandler<CreateProductCommand>
{
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async execute(command: CreateProductCommand) {
    const { product, shop_id } = command;
    const category = await this.categoryRepository.findOneById(
      product.category_id,
    );
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    const timestamp = new Date().getTime();
    //create product
    let newProduct = await this.productRepository.create({
      product_name: product.product_name,
      product_slug: slugify(product.product_name + '-' + timestamp),
      product_description: product.product_description,
      status: product.status,
      product_variants: product.product_variants,
      category: category,
      shop_id: shop_id,
      shipping_information: product.shipping_information,
      is_has_many_classifications: product.is_has_many_classifications,
    });

    if (product.is_has_many_classifications) {
      //await this.productRepository.update(newProduct._id, newProduct);
      const classifications = product.classifications;
      let inventories = product.inventories;
      if (classifications.length === 2) {
        inventories = inventories.map((inventory) => {
          inventory.product_id = newProduct._id;
          inventory.classification_main_id = this.searchItemNameToId(
            classifications[0],
            // @ts-ignore
            inventory.classification_main_id.item_name,
          );
          inventory.classification_sub_id = this.searchItemNameToId(
            classifications[1],
            // @ts-ignore
            inventory.classification_sub_id.item_name,
          );
          return inventory;
        });
      } else if (classifications.length === 1) {
        inventories = inventories.map((inventory) => {
          inventory.product_id = newProduct._id;
          inventory.classification_main_id = this.searchItemNameToId(
            classifications[0],
            // @ts-ignore
            inventory.classification_main_id.item_name,
          );
          inventory.classification_sub_id = null;
          return inventory;
        });
      }
      let createdInventories =
        await this.inventoryService.createManyInventories(inventories);

      let minPrice = await this.findMinPriceOfInventories(
        createdInventories as any,
      );

      await this.productRepository.update(newProduct._id, {
        price: minPrice,
        classifications: classifications,
      });
    } else {
      let inventory = await this.inventoryService.createInventory({
        product_id: newProduct._id,
        quantity: product.inventory.quantity,
        price: product.inventory.price,
        discount: 0,
        discount_price: 0,
      } as CreateInventoryDto);

      await this.productRepository.update(newProduct._id, {
        // @ts-ignore
        inventory_id: inventory.inventory_id,
        // @ts-ignore
        price: inventory.price,
      });
    }

    return newProduct._id;
  }

  private searchItemNameToId(classification: any, name: string) {
    for (const item of classification.items) {
      if (item.item_name === name) {
        return item._id;
      }
    }
    return null;
  }

  private async findMinPriceOfInventories(inventories: any[]) {
    let minPrice = Number.MAX_SAFE_INTEGER;
    for (const inventory of inventories) {
      if (inventory.price < minPrice) {
        minPrice = inventory.price;
      }
    }
    return minPrice;
  }
}
