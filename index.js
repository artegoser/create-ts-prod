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

const fs = require("fs");
const path = require("path");
const { prompt } = require("enquirer");
const Listr = require("listr");

async function run() {
  const { execa } = await import("execa");

  const resp = await prompt([
    {
      type: "confirm",
      name: "prisma",
      message: "Do you want to install Prisma?",
    },
  ]);

  let tasks = new Listr([
    {
      title: "Check if package.json exists",
      task: async (_, task) => {
        if (!fs.existsSync("package.json")) {
          await execa("npm", ["init", "-y"]);
        } else {
          task.skip("package.json exists, skipping...");
        }
      },
    },
    {
      title: "Install packages",
      task: async () => {
        await execa("npm", ["i", "-D", ...config.packages.dev]);
        await execa("npm", ["i", ...config.packages.dep]);
      },
    },
    {
      title: "Copy files",
      task: async () =>
        fs.cpSync(path.join(__dirname, "files"), "./", { recursive: true }),
    },
    {
      title: "Modify package.json",
      task: async () => {
        const package_json = JSON.parse(
          fs.readFileSync("package.json", "utf-8")
        );

        package_json.main = "dist/app.js";
        package_json.scripts.build = "tsc";
        package_json.scripts.dev = "ts-node src/app.ts";
        package_json.scripts.start = "node dist/app.js";

        fs.writeFileSync("package.json", JSON.stringify(package_json, null, 2));
      },
    },
    {
      title: "Install Prisma",
      enabled: () => resp.prisma,
      task: async () => {
        await execa("npm", ["i", "-D", "prisma"]);
        await execa("npx", [
          "prisma",
          "init",
          "--datasource-provider",
          "sqlite",
        ]);

        fs.cpSync(path.join(__dirname, "files_options/prisma"), "./", {
          recursive: true,
        });
      },
    },
    {
      title: "Rename files",
      task: async () => {
        fs.renameSync("ts-prod-ignore", ".gitignore");
      },
    },
  ]);

  tasks
    .run()
    .then(() => console.log("Done!"))
    .catch(console.error);
}

run();
