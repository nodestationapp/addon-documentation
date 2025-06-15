import path from "path";
import { glob } from "glob";
import { rootPath } from "@nstation/utils";

import pushAll from "./pushAll.js";

async function docGenerator(props) {
  const docsPath = glob.sync(path.join(rootPath, "src", "tables", "*/"));

  try {
    for await (const table_path of docsPath) {
      await pushAll(table_path, props?.regenerate);
    }

    console.info("✨ Docs successfully generated!");
  } catch (err) {
    console.error(err);
  }
}

export default docGenerator;
