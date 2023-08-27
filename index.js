#!/usr/bin/env node

const config = {
  packages: {
    dev: [
      "@types/node",
      "tsc-watch",
      "typescript",
      "eslint",
      "@typescript-eslint/parser",
      "@typescript-eslint/eslint-plugin",
    ],
    dep: [],
  },
};

const fs = require("fs-extra");
const path = require("path");
const { glob } = require("glob");
const Handlebars = require("handlebars");
const p = require("@clack/prompts");
const runTasks = require("./runTasks");

async function run() {
  const { execa } = await import("execa");

  p.intro("Welcome to create-ts-prod");

  const resp = await p.group(
    {
      prisma: () => p.confirm({ message: "Do you want to install Prisma?" }),
      dotenv: () => p.confirm({ message: "Do you want to install dotenv?" }),
    },
    {
      onCancel: () => {
        p.cancel("Operation cancelled.");
        process.exit(0);
      },
    },
  );

  await runTasks([
    {
      title: "Check if package.json exists",
      task: async () => {
        if (!fs.existsSync("package.json")) {
          await execa("npm", ["init", "-y"]);
          return "package.jspn created";
        } else {
          return "package.json exists, skipping...";
        }
      },
    },
    {
      title: "Install packages",
      task: async () => {
        await execa("npm", ["i", "-D", ...config.packages.dev]);
        await execa("npm", ["i", ...config.packages.dep]);

        return "packages installed";
      },
    },
    {
      title: "Generate files",
      task: async () => {
        const files = await glob("**/*", {
          cwd: path.join(__dirname, "files"),
          nodir: true,
          ignore: !resp.dotenv ? ["src/config/**"] : [],
        });
        for (const file of files) {
          const content = fs.readFileSync(
            path.join(__dirname, "files", file),
            "utf-8",
          );
          await fs.outputFile(
            path.join("./", file),
            Handlebars.compile(content)(resp),
          );
        }

        return "files generated";
      },
    },
    {
      title: "Modify package.json",
      task: async () => {
        const package_json = JSON.parse(
          fs.readFileSync("package.json", "utf-8"),
        );

        package_json.main = "dist/app.js";
        package_json.scripts.build = "tsc";
        package_json.scripts.dev = 'tsc-watch --onSuccess "node ./dist/app.js"';
        package_json.scripts.start = "node dist/app.js";

        fs.writeFileSync("package.json", JSON.stringify(package_json, null, 2));

        return "package.json modified";
      },
    },
    {
      title: "Rename files",
      task: async () => {
        fs.renameSync("ts-prod-ignore", ".gitignore");

        return "files renamed";
      },
    },
    {
      title: "Install Prisma",
      enabled: resp.prisma,
      task: async () => {
        await execa("npm", ["i", "-D", "prisma"]);
        await execa("npx", [
          "prisma",
          "init",
          "--datasource-provider",
          "sqlite",
        ]);

        return "prisma installed";
      },
    },
    {
      title: "Install Dotenv",
      enabled: resp.dotenv,
      task: async () => {
        await execa("npm", ["i", "dotenv"]);

        return "dotenv installed";
      },
    },
  ]);

  p.outro("All done!");
}

run();
