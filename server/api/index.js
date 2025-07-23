import docGenerate from "./docGenerate.js";
// import getTableDocs from "./getTableDocs.js";
// import { yupToOpenAPI } from "./convertToOpenapi.js";

// import loginSchema from "../../../../packages/core/auth/server/utils/validations/loginSchema.js";

(async () => {
  await docGenerate({ regenerate: false });
})();

// const d = yupToOpenAPI([
//   {
//     method: "POST",
//     // handler: login,
//     validation: loginSchema,
//     path: "/admin-api/auth/login",
//   },
// ]);

// console.log(JSON.stringify(d.paths, null, 2));

export default [
  // {
  //   method: "GET",
  //   path: "/tables/:id/docs",
  //   handler: getTableDocs,
  //   auth: ["admin"],
  // },
];
