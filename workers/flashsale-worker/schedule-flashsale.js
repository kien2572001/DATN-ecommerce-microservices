const schedule = require("node-schedule");
const { exec } = require("child_process");
const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient("mongodb://localhost:27017", {});

async function scheduleFlashsales() {
  await mongoClient.connect();
  const db = mongoClient.db("order-service");
  const flashsaleCollection = db.collection("flashsales");
  const existingPlatformFlashSalesInNext30Minutes =
    await flashsaleCollection.exists({
      type: "PLATFORM",
      time_start: {
        $gt: new Date(),
        $lte: new Date(new Date().getTime() + 30 * 60000),
      },
    });

  const existingShopFlashSalesInNext30Minutes =
    await flashsaleCollection.exists({
      type: "SHOP",
      time_start: {
        $gt: new Date(),
        $lte: new Date(new Date().getTime() + 30 * 60000),
      },
    });

  if (existingShopFlashSalesInNext30Minutes) {
    exec(
      "pm2 start check-flashsale-platform.worker.js",
      (err, stdout, stderr) => {
        if (err) {
          console.error(`Error starting PLATFORM worker: ${err}`);
          return;
        }
        console.log("PLATFORM worker started");
      }
    );
  }
  if (existingPlatformFlashSalesInNext30Minutes) {
    exec("pm2 start check-flashsale-shop.worker.js", (err, stdout, stderr) => {
      if (err) {
        console.error(`Error starting SHOP worker: ${err}`);
        return;
      }
      console.log("SHOP worker started");
    });
  }
}

// Lập lịch chạy hàm scheduleFlashsales mỗi phút để kiểm tra và lập lịch các flashsale sắp tới
schedule.scheduleJob("*/5 * * * *", () => {
  scheduleFlashsales();
});

console.log("Flashsale scheduler started");
