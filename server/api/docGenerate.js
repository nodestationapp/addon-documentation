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
    const adminSwaggerPath = path.join(__dirname, "..", "admin-swagger.json");
    const userSwaggerPath = path.join(__dirname, "..", "user-swagger.json");

    const docsPath = glob.sync([
      path.join(rootPath, "node_modules", "@nstation", "*/server/docs/*.json"),
      path.join(rootPath, "plugins", "*/server/docs/*.json"),
    ]);

    let currentAdminDoc = JSON.parse(fs.readFileSync(adminSwaggerPath, "utf8"));
    let currentUserDoc = JSON.parse(fs.readFileSync(userSwaggerPath, "utf8"));

    if (
      (Object.keys(currentAdminDoc).length > 0 ||
        Object.keys(currentUserDoc).length > 0) &&
      !regenerate
    ) {
      return;
    }

    let admin_paths = {};
    let user_paths = {};
    for await (const doc of docsPath) {
      const docData = JSON.parse(fs.readFileSync(doc, "utf8"));

      Object.keys(docData).forEach((path) => {
        if (path.startsWith("/admin-api")) {
          admin_paths[path] = docData[path];
        } else {
          user_paths[path] = docData[path];
        }
      });
    }

    const generatedAdminDoc = {
      openapi: "3.0.0",
      info: {
        title: `${parsedConfig.site.title} (Admin)`,
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
      paths: { ...admin_paths },
    };

    const generatedUserDoc = {
      openapi: "3.0.0",
      info: {
        title: `${parsedConfig.site.title}`,
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
      paths: { ...user_paths },
    };

    fs.writeFileSync(
      adminSwaggerPath,
      JSON.stringify(generatedAdminDoc, null, 2)
    );
    fs.writeFileSync(
      userSwaggerPath,
      JSON.stringify(generatedUserDoc, null, 2)
    );

    return true;
  } catch (err) {
    console.error(err);
  }
};
