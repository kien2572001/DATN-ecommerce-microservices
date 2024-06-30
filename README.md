
# Đồ Án Tốt Nghiệp

Triển khai hệ thống Flash Deal giảm giá trong thương mại điện tử

## Authors

- Nguyen Trung Kien - 20194598 - HUST [@kien2572001](https://github.com/kien2572001)


## Topic

Flash deal là một hình thức khuyến mại phổ biến trong ecommerce. Tới một thời điểm nhất định, các sản phẩm đồng loạt giảm giá. Mỗi sản phẩm có một số lượng nhất định được giảm giá đặc biệt trong một khoảng thời gian nhất định. Yêu cầu thiết kế một hệ thống cho phép:
- Cài đặt giảm giá sản phẩm với một số lượng hữu hạn trong một khoảng thời gian
- Tới thời điểm bắt đầu campaign, giá sản phẩm đồng loạt đổi giá. Số lượng có thể tới 1tr sản phẩm cùng đổi giá đồng thời.
- Nếu khách hàng mua hết lượng giảm giá, sản phẩm trở lại giá thông thường
- Hệ thống phải đáp ứng được yêu cầu mua hàng của hàng nghìn lượt trong cùng một thời điểm, throughput đạt được tối thiểu 3k request/s

Các yêu cầu khó:
- Không được phép bán vượt quá số lượng đặc biệt được giảm giá. 
- Giá khuyến mại sẽ kết thúc ngay khi hết giờ khuyến mại hoặc bán hết số lượng khuyến mại


## Demo

- URL web cho người mua: http://nest.kien2572001.tech
- URL web cho người bán: http://shop.nest.kien2572001.tech

Tài khoản thử nghiệm:
- Người mua: 
  - Tài khoản: nguoimua@gmail.com
  - Mật khẩu: 123456
- Người bán:
  - Tài khoản: nguoiban@gmail.com
  - Mật khẩu: 123456
## Installation

Môi trường chạy:
- NodeJS: v20.15
- PM2 (cài đặt npm install pm2 -g)

Chạy Frontend cho người mua:

```bash
  cd ecommerce-fe
  npm install
  npm run dev
```

Chạy Frontend cho người bán

```bash
  cd dashbroad-fe
  npm install
  npm run dev
```

Chạy Backend:

- Khởi tạo môi trường:

```bash
  cd ecommerce-microservices
  sudo make start
  sudo docker compose -f kafka.docker-compose.dev.yml up
```

- Khởi chạy User Service:

```bash
  cd user-service
  npm install
  npm run start:dev
```

- Khởi chạy Product Service:

```bash
  cd product-service
  npm install
  npm run start:dev
```

- Khởi chạy Inventory Service:

```bash
  cd inventory-service
  npm install
  npm run start:dev
```


- Khởi chạy Order Service:

```bash
  cd order-service
  npm install
  npm run start:dev
```
- Khởi chạy các worker:
  - Order workers

```bash
  cd workers
  npm install
  cd order-worker
  pm2 start ecosystem.config.js
```

  - Flash Deal workers
```bash
  cd workers
  npm install
  cd flashsale-worker
  pm2 start ecosystem.config.js
```