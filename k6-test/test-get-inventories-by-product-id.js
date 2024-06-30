import http from "k6/http";
import { check } from "k6";
import { sleep } from "k6";
import { randomIntBetween } from "k6";
import { SharedArray } from "k6/data";

export let options = {
  stages: [
    { duration: "2s", target: 200 }, // ramp up to 100 users over 30 seconds
    { duration: "3s", target: 200 }, // stay at 100 users for 1 minute
    // { duration: "30s", target: 0 }, // ramp down to 0 users over 30 seconds
  ],
};

const productIds = new SharedArray("productIds", function () {
  const data = [
    "667c27d4663a2844ddb1a397",
    "667c27d4663a2844ddb1a3ac",
    "667c27d4663a2844ddb1a3b8",
    "667c27d4663a2844ddb1a3c1",
    "667c27d4663a2844ddb1a3cd",
  ];
  return data;
});
const productIdsCount = 5;

export default function () {
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const productId = productIds[Math.floor(Math.random() * productIdsCount)];

  const res = http.get(
    `http://localhost:8031/public/inventory/product/${productId}`
  );

  //console.log("Response time: " + res.timings.duration + " ms");
  // console.log("Response body: " + res.body);

  if (res) {
    // Check if the response object is defined
    console.log("Response body: " + res.body);

    // Uncomment the check below if you want to verify status code 200
    // check(res, {
    //   "is status 200": (r) => r.status === 200,
    // });
  } else {
    console.log(`No response received for productId: ${productId}`);
  }

  // check(res, {
  //   "is status 200": (r) => r.status === 200,
  // });
}
