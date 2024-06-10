const { MongoClient, ObjectId } = require("mongodb");

(async () => {
  console.log("Shop flash sale worker started");

  const mongoClient = new MongoClient("mongodb://localhost:27017", {});

  try {
    await mongoClient.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    return;
  }

  const db = mongoClient.db("flashsale-db");
  const flashsaleCollection = db.collection("flashsales");
  const productCollection = db.collection("products");

  const now = new Date();
  const futureTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
  const pageSize = 50; // Number of documents per page
  let lastId = null;
  let hasMore = true;

  while (hasMore) {
    const query = {
      type: "SHOP",
      time_start: { $lte: futureTime, $gt: now },
    };

    if (lastId) {
      query._id = { $gt: lastId };
    }

    const shopFlashsales = await flashsaleCollection
      .find(query)
      .sort({ _id: 1 })
      .limit(pageSize)
      .toArray();

    if (shopFlashsales.length === 0) {
      hasMore = false;
    } else {
      for (const flashsale of shopFlashsales) {
        await productCollection.updateOne(
          { _id: flashsale.product_id },
          { $set: { sale: flashsale } }
        );
        console.log(`Updated product ${flashsale.product_id} with flash sale`);
      }
      lastId = shopFlashsales[shopFlashsales.length - 1]._id;
    }
  }

  mongoClient.close();
})();
