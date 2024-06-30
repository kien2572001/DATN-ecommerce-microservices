import http from "k6/http";
import { check } from "k6";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import { sleep } from "k6";
import { SharedArray } from "k6/data";

export let options = {
  stages: [
    { duration: "0.5s", target: 100 }, // ramp up to 100 users over 30 seconds
    { duration: "9s", target: 100 }, // stay at 100 users for 1 minute
    { duration: "0.5s", target: 0 }, // ramp down to 0 users over 30 seconds
  ],
};

const orderItemsList = new SharedArray("orderItemsList", function () {
  return [
    //shard 1
    [
      {
        inventory_id: "102",
        product_id: "667e721ec54c9dda13281bd3",
        quantity: 1,
        price: 750000,
      },
    ],
    //shard 2
    [
      {
        inventory_id: "105",
        product_id: "667e721ec54c9dda13281bdc",
        quantity: 1,
        price: 963000,
      },
    ],
    //shard 3
    [
      {
        inventory_id: "101",
        product_id: "667e721ec54c9dda13281bd0",
        quantity: 1,
        price: 280000,
      },
    ],
    //shard 4
    [
      {
        inventory_id: "999984",
        product_id: "667e8740a359393c602fa00f",
        quantity: 1,
        price: 696000,
      },
      {
        inventory_id: "167",
        product_id: "667e7220c54c9dda13281c96",
        quantity: 1,
        price: 380000,
      },
    ],
  ];
});

export default function () {
  const random = randomIntBetween(0, 3);
  let orderItems = orderItemsList[random];
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
    order_items: orderItems,
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
