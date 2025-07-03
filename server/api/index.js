import getTableDocs from "./getTableDocs.js";

export default [
  {
    method: "GET",
    path: "/tables/:id/docs",
    handler: getTableDocs,
  },
];
