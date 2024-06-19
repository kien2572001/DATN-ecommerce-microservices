import { Injectable, Inject } from '@nestjs/common';
import { CreateOrderDto } from './dtos/order.create.dto';
import { HttpService } from '@nestjs/axios';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { v4 as uuidv4 } from 'uuid';
import { OrderStatusEnum } from 'src/enums/orderStatus.enum';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { OrderRepository } from './repository/order.repository';

@Injectable()
export class OrderService {
  private readonly inventoryServiceUrl: string;
  private readonly productServiceUrl: string;
  private readonly userServiceUrl: string;

  constructor(
    private readonly orderRepository: OrderRepository,
    private httpService: HttpService,
    @InjectRedis() private readonly client: Redis,
    private readonly configService: ConfigService,
    // @Inject('ORDER_SERVICE') private kafkaClient: ClientKafka,
  ) {
    this.productServiceUrl = this.configService.get('product_service_url');
    this.inventoryServiceUrl = this.configService.get('inventory_service_url');
    this.userServiceUrl = this.configService.get('user_service_url');
  }

  private async checkInventoryAvailabilityAndDeduct(orderItems) {
    try {
      const response = await this.httpService.axiosRef({
        method: 'post',
        url: this.inventoryServiceUrl + '/public/inventory/purchase',
        data: orderItems,
      });

      if (response.data.data) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  private async returnInventoriesInCaseOfOrderFailure(orderItems) {
    try {
      const response = await this.httpService.axiosRef({
        method: 'post',
        url: this.inventoryServiceUrl + '/public/inventory/return',
        data: orderItems,
      });

      if (response.data.data) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  private async removeInventoriesFromCartAfterOrderCreation(
    userId,
    inventoryIds,
  ) {}

  async placeOrder(createOrderDto: CreateOrderDto) {
    // Step 1: Kiểm tra và trừ số lượng tồn kho
    const isInventoryAvailable = await this.checkInventoryAvailabilityAndDeduct(
      createOrderDto.order_items.map((item) => ({
        inventory_id: item.inventory_id,
        quantity: item.quantity,
        price: item.price,
      })),
    );
    if (!isInventoryAvailable) {
      return {
        status: 'failed',
        message: 'Inventory is out of stock',
      };
    }

    try {
      // Step 2: Tạo đơn hàng
      const order = await this.createOrder(createOrderDto);

      // Step 3: Xóa sản phẩm khỏi giỏ hàng
      await this.removeInventoriesFromCartAfterOrderCreation(
        createOrderDto.user_id,
        createOrderDto.order_items.map((item) => item.inventory_id),
      );

      if (createOrderDto.payment_method === 'MOMO') {
        let totalBill =
          createOrderDto.order_items.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0,
          ) + createOrderDto.shipping_fee;
        // Step 4: Tạo payment intent
        const paymentIntent = await this.createPaymentIntent(order, totalBill);
        return {
          status: 'success',
          message: 'Order placed successfully',
          order,
          payment: paymentIntent,
        };
      }

      return {
        status: 'success',
        message: 'Order placed successfully',
        order,
      };
    } catch (error) {
      // Nếu có lỗi xảy ra, quay lui các bước đã thành công

      // Rollback Step 1: Hoàn trả lại số lượng tồn kho đã trừ
      await this.returnInventoriesInCaseOfOrderFailure(
        createOrderDto.order_items.map((item) => ({
          inventory_id: item.inventory_id,
          quantity: item.quantity,
        })),
      );

      // Log lỗi và trả về thông báo lỗi
      console.error('Error placing order:', error);
      return {
        status: 'failed',
        message: 'An error occurred while placing the order',
      };
    }
  }

  async createOrder(createOrderDto: CreateOrderDto) {
    const code = createOrderDto.code || uuidv4();
    const order: any = {};
    order.code = code;
    order.user_id = createOrderDto.user_id;
    order.shop_id = createOrderDto.shop_id;
    order.shipping_address = createOrderDto.shipping_address;
    order.shipping_fee = createOrderDto.shipping_fee;
    order.payment_method = createOrderDto.payment_method;
    order.status = OrderStatusEnum.PENDING;
    order.total = createOrderDto.order_items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    order.created_at = new Date();
    order.updated_at = new Date();
    order.order_items = createOrderDto.order_items.map((item) => {
      const orderItem: any = {};
      orderItem.inventory_id = item.inventory_id;
      orderItem.product_id = item.product_id;
      orderItem.quantity = item.quantity;
      orderItem.price = item.price;
      return orderItem;
    });
    // this.kafkaClient.emit('order.created', JSON.stringify(order)).subscribe(
    //   (data) => {
    //     console.log('Order created event sent');
    //     console.log(data);
    //   },
    //   (error) => {
    //     console.error('Error sending order created event');
    //     console.error(error);
    //   },
    // );

    const randomNumber = Math.floor(Math.random() * 2);
    const queueName = 'order_queue_' + randomNumber;
    await this.client.set('order:' + code, JSON.stringify(order));
    await this.client.rpush(queueName, JSON.stringify(order));
    return order.code;
  }

  async findOrderByCode(code: string) {
    const order: any = await this.orderRepository.findByCode(code);
    console.log('order', order);
    if (!order) {
      throw new Error('Order not found');
    }

    let productIds = order.order_items.map((item) => item.product_id);
    const shopId = order.shop_id;
    const userId = order.user_id;
    // Sử dụng Promise.all để lấy thông tin sản phẩm và thông tin cửa hàng cùng một lúc
    const [productDetails, shopDetails, userDetails] = await Promise.all([
      this.getProductByListIds(productIds),
      this.getShopByListIds([shopId]),
      this.getUserByListIds([userId]),
    ]);

    order.shop = shopDetails[0];
    order.user = userDetails[0];
    order.order_items.forEach((item: any) => {
      const product = productDetails.find(
        (product: any) => product._id === item.product_id,
      );
      if (product) {
        item.product = product;
      }
    });

    return order;
  }

  async findOrdersByUserId(userId: string, page: number, limit: number) {
    return await this.orderRepository.findOrdersByUserIdWithPagination(
      userId,
      page,
      limit,
    );
  }

  async findOrdersByShopId(
    shopId: string,
    page: number,
    limit: number,
    status: string,
    code: string,
  ) {
    let orders = await this.orderRepository.findOrdersByShopIdWithPagination(
      shopId,
      page,
      limit,
      status,
      code,
    );
    if (orders.docs.length === 0) {
      return orders;
    }
    const listUserIds = orders.docs.map((order) => order.user_id);
    const userIds: any[] = [...new Set(listUserIds)];
    //console.log('userIds', userIds);
    const users = await this.getUserByListIds(userIds);
    //console.log('users', users);
    orders.docs = orders.docs.map((order) => {
      const user = users.find((user) => user._id === order.user_id);
      if (user) {
        return { ...order, user };
      }
      return order;
    });
    return orders;
  }

  //supporting function
  async getProductByListIds(ids: string[]) {
    try {
      const response = await this.httpService.axiosRef({
        url: this.productServiceUrl + '/public/product/by-list-ids',
        method: 'post',
        data: {
          ids,
          populate: [],
          includes: [
            '_id',
            'shop_id',
            'product_name',
            'is_has_many_classifications',
            'classifications',
            'images',
          ],
        },
      });

      return response.data.data;
    } catch (err) {
      console.log(err);
      return [];
    }
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

  async getUserByListIds(ids: string[]) {
    try {
      const response = await this.httpService.axiosRef({
        url: this.userServiceUrl + '/user/by-list-ids',
        method: 'post',
        data: {
          ids,
          populate: [],
          includes: ['_id', 'username', 'email', 'phone_number', 'address'],
        },
      });

      return response.data.data;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async handleMomoIPN(body: any) {
    const { orderId, resultCode } = body;
    if (resultCode === 0) {
      await this.orderRepository.updateByCode(orderId, {
        status: OrderStatusEnum.PAID,
      });
      this.client.publish(
        'socket_queue',
        JSON.stringify({ orderId, status: OrderStatusEnum.PAID }),
      );
    } else {
      // await this.orderRepository.update(orderId, {
      //   status: OrderStatusEnum.FAILED,
      // });
    }
  }

  async createPaymentIntent(orderCode: string, totalBill: number) {
    console.log('--------------------CREATE PAYMENT INTENT----------------');
    console.log('Order code:', orderCode);
    console.log('Total bill:', totalBill);
    var accessKey = 'F8BBA842ECF85';
    var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    var orderInfo = 'pay with MoMo';
    var partnerCode = 'MOMO';
    var redirectUrl = process.env.ECOMMERCE_FE_URL + '/orders/' + orderCode;
    var ipnUrl =
      'https://balanced-collie-quietly.ngrok-free.app/public/order/payment/momo-ipn';
    var requestType = 'payWithMethod';
    var amount = totalBill;
    var orderId = orderCode;
    var requestId = orderId;
    var extraData = '';
    var paymentCode =
      'T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==';
    var orderGroupId = '';
    var autoCapture = true;
    var lang = 'vi';

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature =
      'accessKey=' +
      accessKey +
      '&amount=' +
      amount +
      '&extraData=' +
      extraData +
      '&ipnUrl=' +
      ipnUrl +
      '&orderId=' +
      orderId +
      '&orderInfo=' +
      orderInfo +
      '&partnerCode=' +
      partnerCode +
      '&redirectUrl=' +
      redirectUrl +
      '&requestId=' +
      requestId +
      '&requestType=' +
      requestType;
    //puts raw signature
    console.log('--------------------RAW SIGNATURE----------------');
    console.log(rawSignature);
    //signature
    const crypto = require('crypto');
    var signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');
    console.log('--------------------SIGNATURE----------------');
    console.log(signature);

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature,
    });

    try {
      const response = await this.httpService.axiosRef({
        url: 'https://test-payment.momo.vn/v2/gateway/api/create',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        data: requestBody,
      });

      console.log('--------------------RESPONSE----------------');
      console.log(response.data);

      return response.data;
    } catch (err) {
      console.log(err);
      return {};
    }
  }
}
