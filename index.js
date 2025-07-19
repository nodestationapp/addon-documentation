#!/usr/bin/env node

import docGenerator from "./server/api/docGenerate.js";

if (process.argv[2] === "generate") {
  docGenerator({ regenerate: true });
}
