import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";

let env = "https://pro-staging.uk.natoora.com/api";

// -------------- Token
let tokeData = new SharedArray("tokenData", function () {
  return JSON.parse(open("data/test_data.json")).tokens;
});

let randomToken = tokeData[Math.floor(Math.random() * tokeData.length)];

// -------------- Products
let productsData = new SharedArray("productsData", function () {
  return JSON.parse(open("data/test_data.json")).products;
});

let randomProduct =
  productsData[Math.floor(Math.random() * productsData.length)];

let searchProduct = `${env}/search-products?product=${randomProduct}`;

const customerProductApi = `${env}/products/customer-products`;

// -------------- Categories

let categoriesData = new SharedArray("categoriesData", function () {
  return JSON.parse(open("data/test_data.json")).categories;
});

let randomCategoryId =
categoriesData[Math.floor(Math.random() * categoriesData.length)];

let categoriesApi = `${env}/search-products?searchCategoryId=${randomCategoryId}&`;

// ------------- Perf Test Execution block ----------------------------
export let options = {
  scenarios: {
    //   // constant_arrival_scenario: {
    //   //   executor: "constant-arrival-rate",
    //   //   rate: 2,
    //   //   duration: "5m",
    //   //   preAllocatedVUs: 15,
    //   //   maxVUs: 20,
    //   // },
    ramping_arrival_scenario: {
      executor: "ramping-arrival-rate",
      startRate: 10,
      timeUnit: "1s",
      preAllocatedVUs: 10,
      maxVUs: 50,
      stages: [
        {
          target: 100,
          duration: "5m",
        },
      ],
    },
  },
  // vus: 50,
  // duration: "30s",
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

export default function () {
  // const jar = http.cookieJar();
  // jar.clear();
  // if (Math.random() < 0.1) {
  //   jar.clear();
  // }
  // const response = http.get('https://hd-staging.natoora.com/api/products/v2/products?', {
  //   headers: {
  //     Accepts: "application/json",
  //     authorization: `jwt ${randomToken}`,
  //   },
  // });

  const response = http.get('https://hd-staging.natoora.com/api/products/v2/products?');
  check(response, {
    "status is 200": (r) => r.status === 200,
    "Response time is within acceptable limit": (r) => r.timings.duration < 100,
  });

  console.log(JSON.stringify(response.body));
  console.log(response.url);
  console.log(`time ${response.timings.duration}`);
  console.log(response.status);

  // console.log(JSON.stringify(response.json(), null, "  "));
  console.log(response.body);
  console.log("\n----------------------END------------------------------");
  sleep(0.5);
}
