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
  port: 6380,
  host: "localhost",
});

// Hàm startFlashSale
async function startFlashSale() {
  await orderServiceClient.connect();
  console.log("Connected to MongoDB");
  // Kiểm tra kết nối Redis
  if (!redisClient.status || redisClient.status === "end") {
    await redisClient.connect();
    console.log("Connected to Redis");
  }

  const orderServiceDB = orderServiceClient.db();
  const flashsaleCollection = orderServiceDB.collection("flashsales");

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();
  const startTime = new Date("06/14/2024 19:00");
  // const startTime = new Date(
  //   now.getFullYear(),
  //   now.getMonth(),
  //   now.getDate(),
  //   currentHour + 1,
  //   0,
  //   0
  // );

  console.log("Start flash sale at", startTime);

  const flashsales = await flashsaleCollection
    .find({
      time_start: startTime,
      is_active: true,
    })
    .toArray();

  if (flashsales.length === 0) {
    console.log("No flash sale to start");
    process.exit(0);
  }
  const inventories = [];

  console.log("Starting flash sale");
  // Start flash sale
  // ...
  for (const flashsale of flashsales) {
    // ...
    console.log(`Flash sale started: ${flashsale._id}`);
    for (const product of flashsale.products) {
      for (const item of product.items) {
        inventories.push(item);
      }
    }
  }

  console.log("Flash sale started");
  console.log("inventories", inventories);
  const response = await axios.post(
    "http://localhost:8031/public/inventory/init-flash-sale",
    {
      inventories,
      startTime: new Date("06/14/2024 19:00"),
      endTime: new Date("06/14/2024 21:00"),
    }
  );
  console.log(response.data);
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
startFlashSale();
