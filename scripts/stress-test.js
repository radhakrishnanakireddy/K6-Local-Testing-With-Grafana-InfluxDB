import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";

let tokeData = new SharedArray("tokenData", function () {
  return JSON.parse(open("data/test_data.json")).tokens;
});

// Reading random tag from the JSON file
let randomToken = tokeData[Math.floor(Math.random() * tokeData.length)];

let productsData = new SharedArray("productsData", function () {
  return JSON.parse(open("data/test_data.json")).products;
});

// Reading random tag from the JSON file
let randomProduct =
  productsData[Math.floor(Math.random() * productsData.length)];

// ------------- Perf Test Execution block ----------------------------
export let options = {
  scenarios: {
    // constant_arrival_scenario: {
    //   executor: "constant-arrival-rate",
    //   rate: 2,
    //   duration: "5m",
    //   preAllocatedVUs: 15,
    //   maxVUs: 20,
    // },
    ramping_arrival_scenario: {
        executor: 'ramping-arrival-rate',
        startRate: 2,
        timeUnit: '1s',
        preAllocatedVUs: 2,
        maxVUs: 20,
        stages: [{
                target: 10,
                duration: '30s'
            },
        ],
    },
  },
  thresholds: {
    checks: ["rate>0.99"],
    // http_req_duration: [
    //   {
    //     // threshold: "p(95) < 100",
    //     // abortOnFail: true,
    //   },
    // ],
  },
};

const customerProductApi =
  "https://pro-staging.uk.natoora.com/api/products/customer-products";
const categoriesApi =
  "https://pro-staging.uk.natoora.com/api/search-products?searchCategoryId=28&";

export default function () {
  const response = http.get(customerProductApi, {
    headers: {
      Accepts: "application/json",
      authorization: `jwt ${randomToken}`,
    },
  });
  check(response, {
    "status is 200": (r) => r.status === 200,
    'Response time is within acceptable limit': (r) => r.timings.duration < 60000,
  });
  console.log(`time ${response.timings.duration}`)
  // console.log("\n----------------------------------------------------");
  // console.log(`\n ${randomProduct} :: ${randomToken}`);
  // console.log("\n----------------------------------------------------");
  sleep(0.3);
}
