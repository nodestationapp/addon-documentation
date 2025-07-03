import path from "path";
import { glob } from "glob";
import { rootPath } from "@nstation/utils";

import pushAll from "./pushAll.js";

async function docGenerator(props) {
  const docsPath = glob.sync(path.join(rootPath, "src", "tables", "*/"));

  console.info("");
  console.info("Generated documentation:");
  console.info("");

  try {
    for await (const table_path of docsPath) {
      const relative = path.relative(rootPath, table_path);
      const location = "/" + relative.replace(/\\/g, "/");

      await pushAll(table_path, props?.regenerate);
      console.info(`→ ${location}`);
    }

    console.info("");
    console.info("✅ Documentation generation completed successfully.");
  } catch (err) {
    console.error(err);
  }
}

export default docGenerator;
