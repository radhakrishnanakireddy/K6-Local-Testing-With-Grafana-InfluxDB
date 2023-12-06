import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";

const baseURL = "https://pro-staging.uk.natoora.com/api";
const randomToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo2NzY2LCJ1c2VybmFtZSI6InJhZGhhLm5ha2lyZWRkeSt1azFAbmF0b29yYS5jb20iLCJleHAiOjE3MzI2MjE5NzIsImVtYWlsIjoicmFkaGEubmFraXJlZGR5K3VrMUBuYXRvb3JhLmNvbSIsIm9yaWdfaWF0IjoxNzAxODYzNTcyfQ.ii1tQ21d44bE5jcvMloRbTaAJxMc5USaatb46FLYviA";

// -------------- orderItemIds
let orderItemData = new SharedArray("orderItemData", function () {
  return JSON.parse(open("data/test_data.json")).orderItemIds;
});

let randomOrderItem =
  orderItemData[Math.floor(Math.random() * orderItemData.length)];

// -------------- units
let unitsData = new SharedArray("unitsData", function () {
  return JSON.parse(open("data/test_data.json")).unitTypes;
});

let randomUnitType = unitsData[Math.floor(Math.random() * unitsData.length)];

const putRequestBody = {
  orderId: 510837,
  customer_product: 589,
  quantity_ordered: 1,
  unit_ordered: randomUnitType,
  date_time_added: "2023-12-06 12:08:32",
};

export let options = {
  scenarios: {
    ramping_arrival_scenario: {
      executor: "ramping-arrival-rate",
      startRate: 10,
      timeUnit: "1s",
      preAllocatedVUs: 10,
      maxVUs: 50,
      stages: [
        {
          target: 100,
          duration: "10s",
        },
      ],
    },
  },
  thresholds: {
    checks: ["rate>0.99"],
  },
};

export default function () {
  const url = `${baseURL}/orders/v2/orderitems/${randomOrderItem}`;

  const params = {
    headers: {
      Accepts: "application/json",
      Authorization: `jwt ${randomToken}`,
    },
  };

  const response = http.put(url, putRequestBody, params);

  check(response, {
    "status is 200": (r) => r.status === 200,
    "Response time is within acceptable limit": (r) => r.timings.duration < 100,
  });

  console.log(response.url);
  console.log(`time ${response.timings.duration}`);
  console.log(response.status);
  console.log(response.body);
  console.log("\n----------------------END------------------------------");
  sleep(0.5);
}
