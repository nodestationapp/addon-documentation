import swaggerUi from "swagger-ui-express";
import { rootPath } from "@nstation/utils";
import path from "path";
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
  async register(app) {
    try {
      let userOpenApiDocument = await import(
        path.join(rootPath, "src", "documentation", "user-openapi.json"),
        {
          assert: { type: "json" },
        }
      );
      userOpenApiDocument = userOpenApiDocument.default;

      let adminOpenApiDocument = await import(
        path.join(rootPath, "src", "documentation", "admin-openapi.json"),
        {
          assert: { type: "json" },
        }
      );
      adminOpenApiDocument = adminOpenApiDocument.default;

      if (userOpenApiDocument) {
        app.express.use(
          "/admin-api-docs",
          // basicAuth({
          //   users: { admin: "admin" },
          //   challenge: true,
          // }),
          swaggerUi.serve,
          swaggerUi.setup(userOpenApiDocument)
        );

        app.express.use(
          "/api-docs",
          // basicAuth({
          //   users: { admin: "admin" },
          //   challenge: true,
          // }),
          swaggerUi.serve,
          swaggerUi.setup(adminOpenApiDocument)
        );
      }
    } catch (err) {
      console.error("Documentation files not found");
    }
  },
};
