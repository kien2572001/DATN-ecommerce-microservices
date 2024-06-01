import http from "k6/http";
import { check } from "k6";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

export let options = {
  stages: [
    { duration: "2s", target: 1000 }, // ramp up to 100 users over 30 seconds
    { duration: "3s", target: 1000 }, // stay at 100 users for 1 minute
    // { duration: "1s", target: 0 }, // ramp down to 0 users over 30 seconds
  ],
};

export default function () {
  const inventory_id = "1";
  const payload = JSON.stringify({
    user_id: "665a1e67eee282d3bdaf0ffe",
    shop_id: "665a1e67eee282d3bdaf11ff",
    shipping_fee: 15000,
    payment_method: "COD",
    shipping_address: {
      street: "123 Main St",
      city: "Hometown",
      state: "HT",
      zip: "12345",
      country: "USA",
    },
    order_items: [
      {
        inventory_id: "1",
        product_id: "665a927aa69f24f8091aa67c",
        quantity: 1,
        price: 620000,
      },
      {
        inventory_id: "2",
        product_id: "665a927aa69f24f8091aa67f",
        quantity: 1,
        price: 876000,
      },
    ],
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const loadBalancerPort = randomIntBetween(8084, 8086);

  const res = http.post(
    `http://localhost:${loadBalancerPort}/public/order/checkout`,
    payload,
    params
  );
  console.log(loadBalancerPort);
  //console.log("Response time: " + res.timings.duration + " ms");
  // console.log("Response body: " + res.body);

  check(res, {
    "success buy": (r) => JSON.parse(r.body).data == true,
    "fail buy": (r) => JSON.parse(r.body).data != true,
    "is status 201": (r) => r.status === 201,
    "is status 400": (r) => r.status === 400,
  });
}
