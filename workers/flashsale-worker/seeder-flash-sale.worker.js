const { MongoClient, ObjectId } = require("mongodb");
const Redis = require("ioredis");
const axios = require("axios");

const userClient = new MongoClient(
  "mongodb://localhost:27017/user-service",
  {}
);
const productServiceClient = new MongoClient(
  "mongodb://localhost:27017/product-service",
  {}
);
const orderServiceClient = new MongoClient(
  "mongodb://localhost:27017/order-service",
  {}
);

const now = new Date();
const TIME_START = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes later
const TIME_END = new Date(TIME_START.getTime() + 60 * 60 * 1000); // 60 minutes later

// Function to log memory and CPU usage
function logResourceUsage() {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  console.log(
    `Memory Usage: RSS ${memoryUsage.rss}, Heap Total ${memoryUsage.heapTotal}, Heap Used ${memoryUsage.heapUsed}`
  );
  console.log(`CPU Usage: User ${cpuUsage.user}, System ${cpuUsage.system}`);
}

// Create flashsale event for testing- sale 50% for all products
async function seederFlashSaleEvent() {
  try {
    await userClient.connect();
    await productServiceClient.connect();
    await orderServiceClient.connect();

    const userDB = userClient.db();
    const productDB = productServiceClient.db();
    const orderDB = orderServiceClient.db();

    const usersCollection = userDB.collection("users");
    const productsCollection = productDB.collection("products");
    const flashsaleProductCollection = orderDB.collection("flashsaleproducts");

    const pageSize = 500;
    let lastId = null;
    let hasMore = true;
    const start = performance.now();
    const batchInsert = [];

    while (hasMore) {
      const query = {
        ...(lastId && { _id: { $gt: lastId } }),
      };

      const products = await productsCollection
        .find(query)
        .sort({ _id: 1 })
        .limit(pageSize)
        .project({ _id: 1 })
        .toArray();

      if (products.length === 0) {
        hasMore = false;
      } else {
        console.log(`Processing ${products.length} items`);
        const promises = products.map((product) =>
          getInventoriesByProductId(product._id)
        );

        const inventoriesArrays = await Promise.all(promises);
        for (let i = 0; i < products.length; i++) {
          const product = products[i];
          const inventories = inventoriesArrays[i];

          const items = inventories.map((inventory) => ({
            inventory_id: inventory.inventory_id,
            price: inventory.price,
            flash_sale_price: inventory.price / 2,
            flash_sale_quantity: 100,
            flash_sale_percentage: 50,
          }));

          const flashsaleProduct = {
            flash_sale_id: "667954146861e72bdc95cf5b",
            product_id: product._id,
            status: "not_started",
            is_active: true,
            time_start: TIME_START,
            time_end: TIME_END,
            items,
          };

          batchInsert.push(flashsaleProduct);
        }

        if (batchInsert.length >= 100) {
          await flashsaleProductCollection.insertMany(batchInsert);
          batchInsert.length = 0;
        }

        lastId = products[products.length - 1]._id;
      }

      // Log resource usage after processing each batch
      logResourceUsage();
    }
    const end = performance.now();
    console.log("Processing time", (end - start) / 1000, "s");
  } catch (error) {
    console.error("Seeder flash sale event failed", error);
  } finally {
    await userClient.close();
    await productServiceClient.close();
    await orderServiceClient.close();
    process.exit(0);
  }
}

async function getInventoriesByProductId(productId) {
  try {
    const response = await axios.get(
      "http://localhost:8031/public/inventory/product/" + productId
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching inventories:", error);
    return [];
  }
}

seederFlashSaleEvent();
