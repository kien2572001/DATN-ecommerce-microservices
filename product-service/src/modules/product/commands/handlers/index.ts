import { CreateProductHandler } from './create-product.handler';
import { UpdateProductMediaHandler } from './update-product-media.handler';
import { DeleteProductByIdHandler } from './delete-product-by-id.handler';
import { UpdateProductHandler } from './update-product.handler';
export const ProductCommandHandlers = [
  CreateProductHandler,
  UpdateProductMediaHandler,
  DeleteProductByIdHandler,
  UpdateProductHandler,
];
