import getTableDocs from "./getTableDocs.js";
import auth from "@nstation/auth/utils/authMiddleware.js";

export default [
  {
    method: "GET",
    path: "/tables/:id/docs",
    handler: getTableDocs,
    middlewares: [auth(["admin"])],
  },
];
