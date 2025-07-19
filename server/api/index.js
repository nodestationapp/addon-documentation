import joinDocs from "./joinDocs.js";
import getTableDocs from "./getTableDocs.js";
import auth from "@nstation/auth/utils/authMiddleware.js";

(async () => {
  await joinDocs({ regenerate: false });
})();

export default [
  {
    method: "GET",
    path: "/tables/:id/docs",
    handler: getTableDocs,
    middlewares: [auth(["admin"])],
  },
];
