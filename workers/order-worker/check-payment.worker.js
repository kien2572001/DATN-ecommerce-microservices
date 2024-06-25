const { MongoClient } = require("mongodb");
// Cấu hình kết nối MongoDB
const client = new MongoClient("mongodb://localhost:27017", {});
const { Kafka } = require("kafkajs");
const { v4: uuidv4 } = require("uuid");
// Cấu hình thời gian
const CHECK_INTERVAL = 60 * 1000; // 1 phút
const PAYMENT_PENDING_TIME = 10 * 60 * 1000; // 10 phút

// Hàm kiểm tra đơn hàng
async function checkOrders() {
  try {
    await client.connect();
    const database = client.db("order-service");
    const orders = database.collection("orders");

    // Init Kafka
    // Kafka configuration
    const kafka = new Kafka({
      clientId: "check-payment-worker" + uuidv4(),
      brokers: ["localhost:9092"],
    });
    const producer = kafka.producer();
    await producer.connect();

    // Lấy thời gian hiện tại và trừ đi thời gian thanh toán chưa hoàn thành
    const tenMinutesAgo = new Date(Date.now() - PAYMENT_PENDING_TIME);
    console.log("10 phút trước:", tenMinutesAgo);

    // Truy vấn các đơn hàng chưa hoàn thành thanh toán
    const query = {
      status: "payment_pending",
      payment_method: { $ne: "COD" },
      created_at: { $lt: tenMinutesAgo },
    };

    const results = await orders.find(query).toArray();

    if (results.length > 0) {
      console.log("Các đơn hàng chưa hoàn thành thanh toán sau 10 phút:");
      results.forEach((order) => {
        console.log(order);
        producer.send({
          topic: "order.payment.failed",
          messages: [
            {
              key: order.code,
              value: JSON.stringify(order),
            },
          ],
        });
      });
    } else {
      console.log(
        "Không có đơn hàng nào chưa hoàn thành thanh toán sau 10 phút."
      );
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

// Chạy hàm kiểm tra đơn hàng mỗi 1 phút
setInterval(checkOrders, CHECK_INTERVAL);

// Chạy hàm kiểm tra đơn hàng ngay lập tức khi khởi động
checkOrders();
