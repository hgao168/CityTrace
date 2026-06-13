const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const jsonFiles = [
  "app.json",
  "project.config.json",
  "sitemap.json",
  "pages/journey/journey.json",
];
const scriptFiles = [
  "app.js",
  "config.js",
  "data/places.js",
  "pages/journey/journey.js",
  "services/repository.js",
  "utils/journey.js",
  "utils/storage.js",
];

jsonFiles.forEach(function (relativePath) {
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
});

scriptFiles.forEach(function (relativePath) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  new vm.Script(source, { filename: relativePath });
});

const wxml = fs.readFileSync(
  path.join(root, "pages/journey/journey.wxml"),
  "utf8",
);
["<map", "bindmarkertap", "bindtap=\"markArrived\"", "wx:for=\"{{places}}\""].forEach(
  function (requiredToken) {
    if (wxml.indexOf(requiredToken) < 0) {
      throw new Error("Missing journey template token: " + requiredToken);
    }
  },
);

["strong", "div", "span", "article", "section"].forEach(function (htmlTag) {
  if (new RegExp("<" + htmlTag + "(\\s|>)").test(wxml)) {
    throw new Error("Unsupported HTML element in WXML: " + htmlTag);
  }
});

[
  "assets/marker-active.png",
  "assets/marker-done.png",
  "assets/marker-upcoming.png",
].forEach(function (relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error("Missing map marker asset: " + relativePath);
  }
});

console.log("WeChat Mini Program configuration and source syntax are valid.");
