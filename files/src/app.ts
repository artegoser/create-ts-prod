{{#if dotenv}}
import { IConfigService } from "./config/config.interface";
import { ConfigService } from "./config/config.service";
{{/if}}
{{#if prisma}}
import { PrismaClient } from "@prisma/client";
{{/if}}

class App {
  {{#if dotenv}}
  config: IConfigService;
  {{/if}}
  {{#if prisma}}
  prisma: PrismaClient;
  {{/if}}
  constructor() {
    {{#if dotenv}}
    this.config = new ConfigService();
    {{/if}}
    {{#if prisma}}
    this.prisma = new PrismaClient();
    {{/if}}
  }
  init() {}
}

const app = new App();
app.init();
