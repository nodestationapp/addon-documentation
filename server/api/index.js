import getTableDocs from "./getTableDocs.js";
import docGenerator from "./docGenerator/index.js";

docGenerator();

export default [
  {
    method: "GET",
    path: "/tables/:id/docs",
    handler: getTableDocs,
  },
];
