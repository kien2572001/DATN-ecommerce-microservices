import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductsHomepageQuery } from '../impl/get-products-in-homepage.query';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Product, ProductSchema } from '../../repository/product.schema';
import { InventoryService } from '../../../inventory/inventory.service';
import { CategoryRepository } from 'src/modules/category/repository/category.repository';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ProductStatusEnum } from 'src/enums/productStatus.enum';
@QueryHandler(GetProductsHomepageQuery)
export class GetProductsHomePageHandler
  implements IQueryHandler<GetProductsHomepageQuery>
{
  private readonly userServiceUrl: string;

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: PaginateModel<Product>,
    private readonly inventoryService: InventoryService,
    private readonly categoryRepository: CategoryRepository,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.userServiceUrl = this.configService.get('user_service_url');
  }

  async execute(query: GetProductsHomepageQuery) {
    const {
      page,
      limit,
      keyword,
      category_slug,
      trending,
      popular,
      newArrival,
    } = query;
    console.log('query', query);
    const queryCondition: any = {
      deleted_at: null,
      product_name: { $regex: keyword, $options: 'i' },
      status: ProductStatusEnum.ACTIVE,
    };
    const options: any = {
      page: page,
      limit: limit,
      lean: true,
    };
    if (trending === 'true') {
      options.sort = { trending_score: -1 };
    }
    if (popular === 'true') {
      options.sort = { popular_score: -1 };
    }
    if (newArrival === 'true') {
      options.sort = { created_at: -1 };
    }

    if (
      query.category_slug &&
      query.category_slug !== 'undefined' &&
      query.category_slug !== ''
    ) {
      const category = await this.categoryRepository.findOneByCondition({
        category_slug: category_slug,
      });

      if (!category) {
        throw new Error('Category not found');
      }
      const categoryChildren = await this.categoryRepository.findSubCategories(
        category.path,
      );
      const categoryIds = categoryChildren.map((category) =>
        category._id.toString(),
      );
      categoryIds.push(category._id.toString());
      queryCondition.category = { $in: categoryIds };
    }

    const products = await this.productModel.paginate(queryCondition, options);
    const listShopIds = products.docs.map((product) => product.shop_id);
    const listProductIds = products.docs.map((product) => product.id); // Assuming you need product IDs for inventories
    // Run both asynchronous functions in parallel
    const [shops, inventories]: [any, any] = await Promise.all([
      this.getShopByListIds(listShopIds),
      this.inventoryService.getInventoriesByProductIds(listProductIds),
    ]);
    products.docs = products.docs.map((product: any) => {
      let foundInventories = inventories.filter(
        (inventory) => inventory.product_id === product._id.toString(),
      );
      let foundShop = shops.find(
        (shop) => shop._id.toString() === product.shop_id,
      );
      product.shop = foundShop;
      product.inventories = foundInventories;
      return product;
    });
    return products;
  }

  async getShopByListIds(ids: string[]) {
    try {
      const response = await this.httpService.axiosRef({
        url: this.userServiceUrl + '/public/shop/by-list-ids',
        method: 'post',
        data: {
          ids,
          populate: [],
          includes: [' _id', 'shop_name', 'address'],
        },
      });

      return response.data.data;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}
