import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateProductMediaCommand } from '../impl/update-product-media.command';
import { FileService } from '../../../../utilities/file.service';
import { ProductRepository } from '../../repository/product.repository';
@CommandHandler(UpdateProductMediaCommand)
export class UpdateProductMediaHandler
  implements ICommandHandler<UpdateProductMediaCommand>
{
  constructor(
    private readonly fileService: FileService,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(command: UpdateProductMediaCommand) {
    const { product_id, files } = command;
    console.log('UpdateProductMediaCommand...');
    console.log('product_id: ', product_id);
    const videos = files.filter((file) => file.mimetype.includes('video'));
    const images = files.filter((file) => file.mimetype.includes('image'));
    const product = await this.productRepository.findOneById(product_id);
    const updatedImages = images
      ? await this.fileService.uploadFiles(images)
      : [];
    const updatedVideos = videos
      ? await this.fileService.uploadFiles(videos)
      : [];

    let previousImages = product.images;
    let previousVideos = product.videos;

    const updatedProduct = await this.productRepository.update(product_id, {
      images: [...previousImages, ...updatedImages],
      videos: [...previousVideos, ...updatedVideos],
    });
    return updatedProduct;
  }
}
