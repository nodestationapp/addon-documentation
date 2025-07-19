import fs from "fs";
import path from "path";
import { glob } from "glob";
import { rootPath } from "@nstation/utils";
import requireFromString from "require-from-string";

export default async ({ regenerate = false }) => {
  try {
    let config = fs.readFileSync(
      path.join(rootPath, "nodestation.config.js"),
      "utf-8"
    );

    const parsedConfig = requireFromString(config);

    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const swaggerPath = path.join(__dirname, "..", "swagger.json");

    const docsPath = glob.sync([
      path.join(rootPath, "node_modules", "@nstation", "*/server/docs/*.json"),
      path.join(rootPath, "plugins", "*/server/docs/*.json"),
    ]);

    let currentDoc = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));

    if (Object.keys(currentDoc).length > 0 && !regenerate) {
      return;
    }

    let paths = {};

    for await (const doc of docsPath) {
      const docData = JSON.parse(fs.readFileSync(doc, "utf8"));
      paths = { ...paths, ...docData };
    }

    const generatedDoc = {
      openapi: "3.0.0",
      info: {
        title: parsedConfig.site.title,
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      paths: paths,
    };

    fs.writeFileSync(swaggerPath, JSON.stringify(generatedDoc, null, 2));

    return true;
  } catch (err) {
    console.error(err);
  }
};
