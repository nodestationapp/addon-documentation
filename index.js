#!/usr/bin/env node

import dotenv from "dotenv";
import docGenerate from "./server/api/docGenerate.js";

dotenv.config();

if (process.argv[2] === "generate") {
  console.info("");
  console.info("Generated documentation:");
  console.info("");

  await docGenerate({ regenerate: true });

  console.info("");
  console.info("✅ Documentation generation completed successfully.");
}
