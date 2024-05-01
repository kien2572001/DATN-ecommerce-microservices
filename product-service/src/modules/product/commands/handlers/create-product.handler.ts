import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {CreateProductCommand} from "../impl/create-product.command";
import {ProductRepository} from "../../repository/product.repository";
import {FileService} from "../../../../utilities/file.service";
import {CategoryRepository} from "../../../category/repository/category.repository";
import {HttpException, HttpStatus} from "@nestjs/common";

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly fileService: FileService,
    private readonly categoryRepository: CategoryRepository,
  ) {
  }

  async execute(command: CreateProductCommand) {
    const {product, shop_id} = command;
    const files = product.files;
    let productImages = [];
    if (files) {
      productImages = await this.fileService.uploadFiles(files);
    }
    const category = await this.categoryRepository.findOne({
      where: {category_id: product.category_id},
    });
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    const newProduct = this.productRepository.create({
      product_name: product.product_name,
      product_description: product.product_description,
      status: product.status,
      product_variants: product.product_variants,
      multimedia_content: productImages,
      category: category,
      shop_id: shop_id,
    });

    return await this.productRepository.save(newProduct);
  }
}