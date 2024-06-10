import http from "k6/http";
import { check } from "k6";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

export let options = {
  stages: [
    { duration: "1s", target: 300 }, // ramp up to 100 users over 30 seconds
    { duration: "5s", target: 300 }, // stay at 100 users for 1 minute
    // { duration: "1s", target: 0 }, // ramp down to 0 users over 30 seconds
  ],
};

export default function () {
  const payload = JSON.stringify({
    user_id: "665da3604a49ed69a5c82284",
    shop_id: "665da3604a49ed69a5c82485",
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
        inventory_id: "401",
        product_id: "665da3a42ed7b53f9f205538",
        quantity: 1,
        price: 620000,
      },
      {
        inventory_id: "402",
        product_id: "665da3a42ed7b53f9f20553b",
        quantity: 2,
        price: 876000,
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
  console.log("Response body: " + res.body);

  check(res, {
    "success buy": (r) => JSON.parse(r.body).data == true,
    "fail buy": (r) => JSON.parse(r.body).data != true,
    "is status 201": (r) => r.status === 201,
    "is status 400": (r) => r.status === 400,
  });
}
