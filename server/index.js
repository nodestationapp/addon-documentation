import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./user-swagger.json" with { type: "json" };
// import basicAuth from "express-basic-auth";
// import fs from "fs";
// import path from "path";
// import { rootPath } from "@nstation/utils";
// import requireFromString from "require-from-string";

// let config = fs.readFileSync(
//   path.join(rootPath, "nodestation.config.js"),
//   "utf-8"
// );

// const parsedConfig = requireFromString(config);

export default {
  register(app) {
    app.express.use(
      "/api-docs",
      // basicAuth({
      //   users: { admin: "admin" },
      //   challenge: true,
      // }),
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument)
    );
  },
};
