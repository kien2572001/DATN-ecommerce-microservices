// worker.js
const { MongoClient, ObjectId } = require("mongodb");
const cron = require("node-cron");
const axios = require("axios");
const Redis = require("ioredis");
// Kết nối tới MongoDB
const orderServiceClient = new MongoClient(
  "mongodb://localhost:27017/order-service",
  {}
);

const redisClient = new Redis({
  port: 6379,
  host: "localhost",
});

const pageSize = 1000;

// Function to log memory and CPU usage
function logResourceUsage() {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  // Chuyển đổi bộ nhớ từ byte sang megabyte
  const rss = (memoryUsage.rss / 1024 / 1024).toFixed(2);
  const heapTotal = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);
  const heapUsed = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);

  // Chuyển đổi CPU từ microsecond sang giây
  const cpuUser = (cpuUsage.user / 1000000).toFixed(2);
  const cpuSystem = (cpuUsage.system / 1000000).toFixed(2);

  console.log(
    `Memory Usage: RSS ${rss} MB, Heap Total ${heapTotal} MB, Heap Used ${heapUsed} MB`
  );
  console.log(`CPU Usage: User ${cpuUser} s, System ${cpuSystem} s`);
}

// Hàm preSetupFlashSale
async function preSetupFlashSale() {
  await orderServiceClient.connect();
  console.log("Connected to MongoDB");

  if (!redisClient.status || redisClient.status === "end") {
    await redisClient.connect();
    console.log("Connected to Redis");
  }

  const orderServiceDB = orderServiceClient.db();
  const flashsaleProductCollection =
    orderServiceDB.collection("flashsaleproducts");

  const now = new Date();
  const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);
  let lastId = null;
  let hasMore = true;
  const start = performance.now();
  const batchInsert = [];
  const cacheKeys = new Set(); // Sử dụng Set để đảm bảo không thêm trùng lặp vào danh sách cacheKeys

  while (hasMore) {
    const query = {
      time_start: { $lt: thirtyMinutesLater },
      ...(lastId && { _id: { $gt: lastId } }),
    };

    const flashsaleProducts = await flashsaleProductCollection
      .find(query)
      .sort({ _id: 1 })
      .limit(pageSize)
      .toArray();

    if (flashsaleProducts.length === 0) {
      hasMore = false;
    } else {
      //console.log(`Processing ${flashsaleProducts.length} items`);
      for (const flashsaleProduct of flashsaleProducts) {
        const items = flashsaleProduct.items;
        const timeStart = new Date(flashsaleProduct.time_start).getTime();
        const timeEnd = new Date(flashsaleProduct.time_end).getTime();
        for (const item of items) {
          const cacheKey = `inventory:${item.inventory_id}`;
          batchInsert.push([
            "hset",
            cacheKey,
            "flash_sale_price",
            item.flash_sale_price,
          ]);
          batchInsert.push([
            "hset",
            cacheKey,
            "flash_sale_quantity",
            item.flash_sale_quantity,
          ]);
          batchInsert.push([
            "hset",
            cacheKey,
            "flash_sale_start_time",
            timeStart,
          ]);
          batchInsert.push(["hset", cacheKey, "flash_sale_end_time", timeEnd]);
          cacheKeys.add(cacheKey); // Thêm cacheKey vào Set
        }
      }

      // Thực thi batchInsert bằng pipeline của Redis
      const pipeline = redisClient.pipeline();
      batchInsert.forEach((cmd) => pipeline[cmd[0]](...cmd.slice(1)));
      await pipeline.exec();

      // Đẩy các cacheKey đã thay đổi vào danh sách trong Redis
      if (cacheKeys.size > 0) {
        await redisClient.rpush(
          "in_flash_sale_inventory_list_key",
          ...Array.from(cacheKeys)
        );
      }

      batchInsert.length = 0; // Xóa hết các lệnh trong batchInsert
      cacheKeys.clear(); // Xóa hết các cacheKey trong Set

      lastId = flashsaleProducts[flashsaleProducts.length - 1]._id;
      logResourceUsage();
    }
  }

  const end = performance.now();
  console.log("Processing time", (end - start) / 1000, "s");

  console.log("All pages processed");
  process.exit(0);
}

// Lên lịch các tác vụ
// const scheduleTimes = [
//   "0 0 * * *",
//   "0 2 * * *",
//   "0 9 * * *",
//   "0 12 * * *",
//   "0 15 * * *",
//   "0 17 * * *",
//   "0 19 * * *",
//   "0 21 * * *",
// ];

// scheduleTimes.forEach((time) => {
//   cron.schedule(time, startFlashSale);
// });

// Start flash sale
preSetupFlashSale();
