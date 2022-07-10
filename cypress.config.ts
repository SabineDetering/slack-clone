import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
       setupNodeEvents(on, config) {      
      config.baseUrl = 'http://localhost:4200'
      return config
    },
  },
});
