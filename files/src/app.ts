import { IConfigService } from "./config/config.interface";
import { ConfigService } from "./config/config.service";
{{#if prisma}}
import { PrismaClient } from "@prisma/client";
{{/if}}

class App {
  config: IConfigService;
  {{#if prisma}}
  prisma: PrismaClient;
  {{/if}}
  constructor() {
    this.config = new ConfigService();
    {{#if prisma}}
    this.prisma = new PrismaClient();
    {{/if}}
  }
  init() {}
}

const app = new App();
app.init();
