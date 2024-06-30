// worker.js
const { MongoClient, ObjectId } = require("mongodb");
const cron = require("node-cron");
const axios = require("axios");
const Redis = require("ioredis");
const mysql = require("mysql2/promise");

const pageSize = 1000;

// Kết nối tới MongoDB
const orderServiceClient = new MongoClient(
  "mongodb://localhost:27017/order-service",
  {}
);

const redisClient = new Redis({
  port: 6378,
  host: "localhost",
});

const redisClient1 = new Redis({
  port: 6379,
  host: "localhost",
});

const redisClient2 = new Redis({
  port: 6380,
  host: "localhost",
});

const redisClient3 = new Redis({
  port: 6381,
  host: "localhost",
});

const redisClient4 = new Redis({
  port: 6382,
  host: "localhost",
});

const mysqlConnectionConfig = {
  host: "localhost",
  port: 3306,
  user: "root", // thay thế bằng username của bạn
  password: "123456", // thay thế bằng password của bạn
  database: "inventory_service",
};

let mysqlConnection;

// Tạo kết nối tới MySQL một lần khi khởi động
async function connectToMysql() {
  mysqlConnection = await mysql.createConnection(mysqlConnectionConfig);
  console.log("Connected to MySQL");
}

async function findInventoryById(inventoryId) {
  if (!mysqlConnection) {
    throw new Error("MySQL connection is not established");
  }

  // Thực hiện truy vấn tìm kiếm
  const [rows] = await mysqlConnection.execute(
    "SELECT inventory_id, shard_index FROM inventory_entity WHERE inventory_id = ?",
    [inventoryId]
  );

  // Trả về kết quả
  return rows[0] || null;
}

async function getShardIndex(inventoryId) {
  const cacheKey = `inventory:${inventoryId}:shard_index`;
  const cachedShardIndex = await redisClient.get(cacheKey);
  if (cachedShardIndex) {
    return cachedShardIndex;
  } else {
    const inventory = await findInventoryById(inventoryId);
    if (inventory) {
      await redisClient.set(cacheKey, inventory.shard_index);
      return inventory.shard_index;
    }
    return null;
  }
}

async function executeRedisPipeline(redisClient, commands) {
  const pipeline = redisClient.pipeline();
  commands.forEach((cmd) => pipeline[cmd[0]](...cmd.slice(1)));
  await pipeline.exec();
}

async function connectToRedis() {
  if (!redisClient.status || redisClient.status === "end") {
    await redisClient.connect();
    console.log("Connected to Redis");
  }

  if (!redisClient1.status || redisClient1.status === "end") {
    await redisClient1.connect();
    console.log("Connected to Redis 1");
  }

  if (!redisClient2.status || redisClient2.status === "end") {
    await redisClient2.connect();
    console.log("Connected to Redis 2");
  }

  if (!redisClient3.status || redisClient3.status === "end") {
    await redisClient3.connect();
    console.log("Connected to Redis 3");
  }

  if (!redisClient4.status || redisClient4.status === "end") {
    await redisClient4.connect();
    console.log("Connected to Redis 4");
  }
}

// Hàm preSetupFlashSale
async function preSetupFlashSale() {
  await connectToMysql(); // Kết nối tới MySQL
  await orderServiceClient.connect();
  console.log("Connected to MongoDB");

  await connectToRedis(); // Kết nối tới Redis

  const orderServiceDB = orderServiceClient.db();
  const flashsaleProductCollection =
    orderServiceDB.collection("flashsaleproducts");

  const now = new Date();
  const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);
  let lastId = null;
  let hasMore = true;
  const startAll = performance.now();
  const batchInsert1 = [];
  const batchInsert2 = [];
  const batchInsert3 = [];
  const batchInsert4 = [];
  const cacheKeys = new Set(); // Sử dụng Set để đảm bảo không thêm trùng lặp vào danh sách cacheKeys

  const pushToBatchByShardIndex = (shardIndex, cmd) => {
    switch (shardIndex) {
      case "1":
        batchInsert1.push(cmd);
        break;
      case "2":
        batchInsert2.push(cmd);
        break;
      case "3":
        batchInsert3.push(cmd);
        break;
      case "4":
        batchInsert4.push(cmd);
        break;
      default:
        break;
    }
  };

  while (hasMore) {
    const start = performance.now();
    const query = {
      time_start: { $lt: thirtyMinutesLater },
      ...(lastId && { _id: { $gt: lastId } }),
    };

    const startTest = performance.now();
    const flashsaleProducts = await flashsaleProductCollection
      .find(query)
      .sort({ _id: 1 })
      .limit(pageSize)
      .toArray();
    const endTest = performance.now();
    console.log("Test time", (endTest - startTest) / 1000, "s");

    if (flashsaleProducts.length === 0) {
      hasMore = false;
    } else {
      console.log(`Processing ${flashsaleProducts.length} items`);
      const startTest = performance.now();
      for (const flashsaleProduct of flashsaleProducts) {
        const items = flashsaleProduct.items;
        const timeStart = new Date(flashsaleProduct.time_start).getTime();
        const timeEnd = new Date(flashsaleProduct.time_end).getTime();
        for (const item of items) {
          const cacheKey = `inventory:${item.inventory_id}`;
          const shardIndex = await getShardIndex(item.inventory_id);
          pushToBatchByShardIndex(shardIndex, [
            "hset",
            cacheKey,
            "flash_sale_price",
            item.flash_sale_price,
          ]);
          pushToBatchByShardIndex(shardIndex, [
            "hset",
            cacheKey,
            "flash_sale_quantity",
            item.flash_sale_quantity,
          ]);
          pushToBatchByShardIndex(shardIndex, [
            "hset",
            cacheKey,
            "flash_sale_start_time",
            timeStart,
          ]);
          pushToBatchByShardIndex(shardIndex, [
            "hset",
            cacheKey,
            "flash_sale_end_time",
            timeEnd,
          ]);
          //cacheKeys.add(cacheKey); // Thêm cacheKey vào Set
        }
      }

      const endTest = performance.now();
      console.log("Test time", (endTest - startTest) / 1000, "s");

      // Thực thi batchInsert bằng pipeline của Redis
      // const pipeline = redisClient.pipeline();
      // batchInsert.forEach((cmd) => pipeline[cmd[0]](...cmd.slice(1)));
      // await pipeline.exec();

      // Tạo các promises cho các pipeline Redis
      const startPromises = performance.now();
      const promises = [
        executeRedisPipeline(redisClient1, batchInsert1),
        executeRedisPipeline(redisClient2, batchInsert2),
        executeRedisPipeline(redisClient3, batchInsert3),
        executeRedisPipeline(redisClient4, batchInsert4),
      ];

      // Chờ tất cả các promises hoàn thành
      await Promise.all(promises);
      const endPromises = performance.now();
      console.log(
        "Redis pipeline time",
        (endPromises - startPromises) / 1000,
        "s"
      );

      // Đẩy các cacheKey đã thay đổi vào danh sách trong Redis
      // if (cacheKeys.size > 0) {
      //   await redisClient.rpush(
      //     "in_flash_sale_inventory_list_key",
      //     ...Array.from(cacheKeys)
      //   );
      // }

      //batchInsert.length = 0; // Xóa hết các lệnh trong batchInsert
      batchInsert1.length = 0;
      batchInsert2.length = 0;
      batchInsert3.length = 0;
      batchInsert4.length = 0;
      //cacheKeys.clear(); // Xóa hết các cacheKey trong Set

      lastId = flashsaleProducts[flashsaleProducts.length - 1]._id;
      //logResourceUsage();
      const end = performance.now();
      console.log("Query time", (end - start) / 1000, "s");
      console.log(`Processed ${flashsaleProducts.length} items`);
    }
  }

  const endAll = performance.now();
  console.log("Processing time", (endAll - startAll) / 1000, "s");

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
