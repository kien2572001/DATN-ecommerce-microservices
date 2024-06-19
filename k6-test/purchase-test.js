import http from "k6/http";
import { check } from "k6";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

export let options = {
  stages: [
    { duration: "2s", target: 1000 }, // ramp up to 100 users over 30 seconds
    { duration: "5s", target: 1000 }, // stay at 100 users for 1 minute
    // { duration: "30s", target: 0 }, // ramp down to 0 users over 30 seconds
  ],
};

export default function () {
  const payload = JSON.stringify([
    {
      inventory_id: "66538",
      price: 782000,
      quantity: 1,
    },
    {
      inventory_id: "66539",
      price: 782000,
      quantity: 1,
    },
  ]);

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const loadBalancerPort = 8031;

  const res = http.post(
    `http://localhost:${loadBalancerPort}/public/inventory/purchase`,
    payload,
    params
  );

  //console.log("Response time: " + res.timings.duration + " ms");
  //console.log("Response body: " + res.body);

  check(res, {
    "success buy": (r) => JSON.parse(r.body).data == true,
    "fail buy": (r) => JSON.parse(r.body).data != true,
    "is status 201": (r) => r.status === 201,
    "is status 400": (r) => r.status === 400,
  });
}
