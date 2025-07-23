import fs from "fs";
import path from "path";
import { glob } from "glob";
import { rootPath } from "@nstation/utils";
import requireFromString from "require-from-string";
import { yupToOpenAPI } from "./convertToOpenapi.js";

export default async ({ regenerate = false }) => {
  try {
    let config = fs.readFileSync(
      path.join(rootPath, "nodestation.config.js"),
      "utf-8"
    );

    const parsedConfig = requireFromString(config);

    const adminSwaggerPath = path.join(
      rootPath,
      "src",
      "documentation",
      "admin-openapi.json"
    );
    const userSwaggerPath = path.join(
      rootPath,
      "src",
      "documentation",
      "user-openapi.json"
    );
    const documentationOutputPath = path.join(rootPath, "src", "documentation");

    let docsPath = glob.sync([
      path.join(rootPath, "node_modules", "@nstation", "*/server/api/index.js"),
    ]);

    const activePlugins = parsedConfig?.plugins?.filter(
      (plugin) => plugin?.resolve
    );

    const activePluginsDocs = activePlugins
      ?.map((plugin) => plugin.resolve?.replace("./", `${rootPath}/`))
      ?.map((plugin) => path.join(plugin, "server", "api", "index.js"));

    docsPath.push(...activePluginsDocs);

    let currentAdminDoc = {};
    let currentUserDoc = {};
    if (!!fs.existsSync(documentationOutputPath)) {
      currentAdminDoc = JSON.parse(fs.readFileSync(adminSwaggerPath, "utf8"));
      currentUserDoc = JSON.parse(fs.readFileSync(userSwaggerPath, "utf8"));
    }

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
      if (!fs.existsSync(doc)) {
        return;
      }

      const module = await import(doc);
      const docData = module.default;

      const formattedDocData = docData.filter((route) => !route.hidden);

      const openApi = yupToOpenAPI(formattedDocData);

      Object.keys(openApi).forEach((path) => {
        if (path.startsWith("/admin-api")) {
          admin_paths[path] = openApi[path];
        } else {
          user_paths[path] = openApi[path];
          console.info(`→ ${path}`);
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

    if (!fs.existsSync(documentationOutputPath)) {
      await fs.mkdirSync(documentationOutputPath, {
        recursive: true,
      });
    }

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
