import { IConfigService } from "./config/config.interface";
import { ConfigService } from "./config/config.service";

class App {
  config: IConfigService;
  constructor() {
    this.config = new ConfigService();
  }
}

const app = new App();
