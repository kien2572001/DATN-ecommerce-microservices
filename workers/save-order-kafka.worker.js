const { parentPort } = require("worker_threads");
const { MongoClient } = require("mongodb");
const Redis = require("ioredis");
const { Kafka } = require("kafkajs");
const { promisify } = require("util");
const { v4: uuidv4 } = require("uuid");
(async () => {
  console.log("Worker started");

  // Kết nối MongoDB
  const mongoClient = new MongoClient("mongodb://localhost:27017", {});

  try {
    await mongoClient.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    return;
  }

  // Kết nối Redis
  const redisClient = new Redis({
    port: 6380,
    host: "localhost",
  });

  redisClient.on("connect", () => {
    console.log("Connected to Redis");

    // Chuyển phương thức lpop thành asynchronous bằng cách sử dụng promisify
    const lpopAsync = promisify(redisClient.lpop).bind(redisClient);

    // Init Kafka
    // Kafka configuration
    const kafka = new Kafka({
      clientId: "worker" + uuidv4(),
      brokers: ["localhost:9092"],
    });
    const consumer = kafka.consumer({ groupId: "order-consumer" });

    // Lắng nghe message từ parent thread để nhận queue name
    parentPort.on("message", async (data) => {
      if (data.message === "start") {
        let messages = [];

        const client = mongoClient.db("order-service");
        const ordersCollection = client.collection("orders");

        // async function insertManyToMongoDB() {
        //   try {
        //     if (messages.length > 0) {
        //       const result = await ordersCollection.insertMany(messages);
        //       console.log(
        //         "Inserted orders into MongoDB:",
        //         result.insertedCount
        //       );
        //       messages = [];
        //     }
        //   } catch (error) {
        //     console.error("Error inserting orders into MongoDB:", error);
        //   }
        // }

        // Kết nối Kafka
        consumer.connect().then(() => {
          consumer.subscribe({ topic: "order.created" });
          consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
              const order = JSON.parse(message.value.toString());
              // messages.push(order);
              const result = await ordersCollection.insertOne(order);
              console.log("result", result);
              //console.log("Inserted order into MongoDB:", result.insertedId);
            },
          });
        });
        //setInterval(insertManyToMongoDB, 200);
      }
    });
  });

  redisClient.on("error", (error) => {
    console.error("Redis connection error:", error);
  });
})();
