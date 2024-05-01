import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {UpdateProductVariationCommand} from "../impl/update-product-variation.command";
import {ProductVariationRepository} from "../../repository/product-variation.repository";
import {OptionRepository} from "../../repository/option.repository";
import {HttpException, HttpStatus} from "@nestjs/common";
import {UpdateProductVariationDto} from "../../dtos/product-variation.update.dto";
import {UpdateOptionDto} from "../../dtos/option.update.dto";
import {EntityManager} from 'typeorm';
import {InjectEntityManager} from '@nestjs/typeorm';

@CommandHandler(UpdateProductVariationCommand)
export class UpdateProductVariationHandler
  implements ICommandHandler<UpdateProductVariationCommand> {
  constructor(
    private readonly productVariationRepository: ProductVariationRepository,
    private readonly optionRepository: OptionRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager
  ) {
  }

  async execute(command: UpdateProductVariationCommand) {
    const {product_variation, shop_id} = command;

    let existingProductVariation = await this.createOrUpdateProductVariation(
      product_variation,
    );

    let updatedOptions = [];
    let options = product_variation.options;
    updatedOptions = await Promise.all(
      options.map(async option => {
        return await this.createOrUpdateOption(option, existingProductVariation.product_variation_id);
      }),
    );
    existingProductVariation.options = updatedOptions;
    existingProductVariation = await this.productVariationRepository.save(
      existingProductVariation,
    );
    return existingProductVariation;
  }

  async createOrUpdateProductVariation(
    productVariation: UpdateProductVariationDto,
  ) {
    let existingProductVariation: any;

    if (productVariation.product_variation_id) {
      // Update product variation
      existingProductVariation = await this.productVariationRepository.findOneOrFail(
        {
          where: {product_variation_id: productVariation.product_variation_id},
        },
      );
      existingProductVariation.variation_title = productVariation.variation_title;
      existingProductVariation.product_id = productVariation.product_id;
    } else {
      // Create product variation
      existingProductVariation = this.productVariationRepository.create({
        variation_title: productVariation.variation_title,
        product_id: productVariation.product_id,
      });
    }

    return await this.productVariationRepository.save(existingProductVariation);
  }

  async createOrUpdateOption(option: UpdateOptionDto, product_variation_id: number) {
    let existingOption: any;

    if (option.option_id) {
      // Update option
      existingOption = await this.optionRepository.findOneOrFail({
        where: {option_id: option.option_id},
      });
      existingOption.option_title = option.option_title;
    } else {
      // Create option
      existingOption = this.optionRepository.create({
        option_title: option.option_title,
        product_variation: product_variation_id,
      });
    }

    return await this.optionRepository.save(existingOption);
  }
}