import fs from "fs";
import path from "path";
import { rootPath } from "@nstation/utils";

export default async (req, res) => {
  let { id } = req?.params;

  try {
    const tableApiPath = path.join(
      rootPath,
      "src",
      "tables",
      id,
      "api",
      "index.js"
    );

    if (!fs.existsSync(tableApiPath)) {
      return res.status(200).json([]);
    }

    const routesString = fs.readFileSync(
      path.join(rootPath, "src", "tables", id, "api", "index.js"),
      "utf-8"
    );

    let tableDocs = null;
    const docsPath = path.join(
      rootPath,
      "src",
      "tables",
      id,
      "docs",
      "index.json"
    );

    if (fs.existsSync(docsPath)) {
      tableDocs = fs.readFileSync(docsPath, "utf-8");
      tableDocs = JSON.parse(tableDocs);
    } else {
      return res.status(200).json([]);
    }

    const routeRegex =
      /\{\s*method:\s*["'](\w+)["'],\s*path:\s*["']([^"']+)["'][\s\S]*?middlewares:\s*\[([\s\S]*?)\]\s*,/g;

    let match;
    let routes = [];
    while ((match = routeRegex.exec(routesString)) !== null) {
      const method = match[1];
      const path = match[2];
      const middlewaresRaw = match[3];

      const authMatch = middlewaresRaw.match(
        /auth\s*\(\s*\[([\s\S]*?)\]\s*\)/m
      );

      let permissions = [];
      if (authMatch) {
        const permsRaw = authMatch[1];
        permissions = permsRaw
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
      }

      const doc = tableDocs.find((d) => d.path === path && d.method === method);

      routes.push({
        path,
        method,
        permissions,
        body: doc?.body,
        query: doc?.query,
        description: doc?.description,
      });
    }

    return res.status(200).json(routes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
