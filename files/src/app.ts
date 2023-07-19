import { IConfigService } from "./config/config.interface";
import { ConfigService } from "./config/config.service";

class App {
  config: IConfigService;
  constructor() {
    this.config = new ConfigService();
  }
  init() {}
}

const app = new App();
app.init();
