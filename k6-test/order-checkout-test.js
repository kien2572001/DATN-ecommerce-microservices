import http from "k6/http";
import { check } from "k6";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import { sleep } from "k6";

export let options = {
  stages: [
    { duration: "2s", target: 5000 }, // ramp up to 100 users over 30 seconds
    { duration: "6s", target: 5000 }, // stay at 100 users for 1 minute
    { duration: "2s", target: 0 }, // ramp down to 0 users over 30 seconds
  ],
};

export default function () {
  const payload = JSON.stringify({
    code: uuidv4(),
    user_id: "665da3604a49ed69a5c82284",
    shop_id: "665da3604a49ed69a5c8248c",
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
        product_id: "66799728caf84e619ec519be",
        quantity: 1,
        price: 457000,
      },
      {
        inventory_id: "2",
        product_id: "66799728caf84e619ec519c1",
        quantity: 1,
        price: 955000,
      },
    ],
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const loadBalancerPort = 8041;

  const res = http.post(
    `http://localhost:${loadBalancerPort}/public/order/checkout`,
    payload,
    params
  );
  //console.log("Response time: " + res.timings.duration + " ms");
  //console.log("Response body: " + res.body);

  check(res, {
    "success buy": (r) =>
      JSON.parse(r.body).message === "Order created successfully",
    "fail buy": (r) =>
      JSON.parse(r.body).message !== "Order created successfully",
    "is status 201": (r) => r.status === 201,
    "is status 400": (r) => r.status === 400,
  });
}
