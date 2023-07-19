#!/usr/bin/env node

const config = {
  packages: {
    dev: ["@types/node", "ts-node", "typescript"],
    dep: ["dotenv"],
  },
};

const spawn = require("cross-spawn");
const fs = require("fs");
const path = require("path");

//check if package.json exists
if (!fs.existsSync("package.json")) {
  spawn.sync("npm", ["init", "-y"], { stdio: "inherit" });
}

//install packages
spawn.sync("npm", ["i", "-D", ...config.dev.packages]);
spawn.sync("npm", ["i", ...config.dep.packages]);

//copy files

fs.cpSync(path.join(__dirname, "files"), "./", { recursive: true });

//modify package.json

const package = JSON.parse(fs.readFileSync("package.json", "utf-8"));

package.main = "dist/app.js";
package.scripts.build = "tsc";
package.scripts.dev = "ts-node src/app.ts";
package.scripts.start = "node dist/app.js";

fs.writeFileSync("package.json", JSON.stringify(package, null, 2));
