#!/usr/bin/env node

const config = {
  packages: {
    dev: [
      "@types/node",
      "ts-node",
      "typescript",
      "eslint",
      "@typescript-eslint/parser",
      "@typescript-eslint/eslint-plugin",
    ],
    dep: ["dotenv"],
  },
};

const spawn = require("cross-spawn");
const fs = require("fs");
const path = require("path");

//check if package.json exists
console.log("Check if package.json exists");
if (!fs.existsSync("package.json")) {
  console.log("package.json does not exist, creating...");
  spawn.sync("npm", ["init", "-y"], { stdio: "inherit" });
} else {
  console.log("package.json exists, skipping...");
}

//install packages
console.log("Install packages");
spawn.sync("npm", ["i", "-D", ...config.packages.dev], { stdio: "inherit" });
spawn.sync("npm", ["i", ...config.packages.dep], { stdio: "inherit" });
console.log("Packages installed");

//copy files

console.log("Copy files");
fs.cpSync(path.join(__dirname, "files"), "./", { recursive: true });
console.log("Files copied");

//modify package.json

console.log("Modify package.json");

const package = JSON.parse(fs.readFileSync("package.json", "utf-8"));

package.main = "dist/app.js";
package.scripts.build = "tsc";
package.scripts.dev = "ts-node src/app.ts";
package.scripts.start = "node dist/app.js";

fs.writeFileSync("package.json", JSON.stringify(package, null, 2));

console.log("package.json modified");
console.log("Done");
