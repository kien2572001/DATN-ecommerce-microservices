const { MongoClient, ObjectId } = require("mongodb");
const { Kafka } = require("kafkajs");
(async () => {
  console.log("Platform flash sale worker started");

  const orderServiceClient = new MongoClient(
    "mongodb://localhost:27017/order-service",
    {}
  );
  const productServiceClient = new MongoClient(
    "mongodb://localhost:27017/product-service",
    {}
  );

  try {
    await orderServiceClient.connect();
    await productServiceClient.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    return;
  }

  const orderServiceDB = orderServiceClient.db();
  const productServiceDB = productServiceClient.db();

  const flashsaleCollection = orderServiceDB.collection("flashsales");
  const productCollection = productServiceDB.collection("products");

  const now = new Date();
  const futureTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
  const pageSize = 50; // Number of documents per page
  let lastId = null;
  let hasMore = true;
  console.log("Checking platform flash sales");
  // const startTime = new Date(2024, 5, 3, 13, 30); // 3/6/2024 13:30
  // const endTime = new Date(2024, 5, 3, 14, 0); // 3/6/2024 14:00
  // console.log("Start Time: ", startTime);
  // console.log("End Time: ", endTime);

  const kafka = new Kafka({
    clientId: "flashsale-worker",
    brokers: ["localhost:9092"],
  });
  const producer = kafka.producer();
  await producer.connect();

  while (hasMore) {
    const query = {
      type: "PLATFORM",
      time_start: { $lte: futureTime, $gt: now },
      status: "PENDING",
    };

    if (lastId) {
      query._id = { $gt: lastId };
    }

    const platformFlashsales = await flashsaleCollection
      .find(query)
      .sort({ _id: 1 })
      .limit(pageSize)
      .toArray();

    if (platformFlashsales.length === 0) {
      console.log("No more platform flash sales");
      hasMore = false;
    } else {
      console.log(`Found ${platformFlashsales.length} platform flash sales`);
      for (const flashsale of platformFlashsales) {
        console.log("Processing flash sale", flashsale._id);
        // await productCollection.updateOne(
        //   { _id: new ObjectId(flashsale.product_id) },
        //   { $addToSet: { flashsales: flashsale } }
        // );
        await flashsaleCollection.updateOne(
          { _id: new ObjectId(flashsale._id) },
          { $set: { status: "PROCESSED" } }
        );
        await producer.send({
          topic: "flashsale.update-inventory",
          messages: [
            {
              key: flashsale._id.toString(),
              value: JSON.stringify(flashsale),
            },
          ],
        });
        console.log(`Updated product ${flashsale.product_id} with flash sale`);
      }
      lastId = platformFlashsales[platformFlashsales.length - 1]._id;
    }
  }

  await producer.disconnect();
  orderServiceClient.close();
  productServiceClient.close();
})();
