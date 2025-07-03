import fs_sys from "fs";
import path from "path";
import { promises as fs_promise } from "fs";
import { fs, rootPath } from "@nstation/utils";

const getTemplate = (table_name, fields) => {
  fields = fields.filter((field) => field?.slug !== "id");

  const docsPath = path.join(
    rootPath,
    "src",
    "tables",
    table_name,
    "docs",
    "index.json"
  );

  let currentTableDocs = [];

  if (fs_sys.existsSync(docsPath)) {
    currentTableDocs = fs_sys.readFileSync(docsPath, "utf-8");
    currentTableDocs = JSON.parse(currentTableDocs);
  }

  const current_post_index = currentTableDocs.findIndex(
    (item) =>
      item?.method === "POST" && item?.path === `/api/tables/${table_name}`
  );
  const current_get_index = currentTableDocs.findIndex(
    (item) =>
      item?.method === "GET" && item?.path === `/api/tables/${table_name}`
  );
  const current_put_index = currentTableDocs.findIndex(
    (item) =>
      item?.method === "PUT" && item?.path === `/api/tables/${table_name}/:id`
  );
  const current_delete_index = currentTableDocs.findIndex(
    (item) =>
      item?.method === "DELETE" &&
      item?.path === `/api/tables/${table_name}/:id`
  );

  if (current_post_index !== -1) {
    const current_post = currentTableDocs[current_post_index];

    if (!current_post?.ignore) {
      currentTableDocs[current_post_index].body = fields?.map((field) => ({
        name: field?.slug,
        type: field?.type,
        required: field?.required,
      }));
    }
  } else {
    currentTableDocs.push({
      method: "POST",
      path: `/api/tables/${table_name}`,
      body: fields?.map((field) => ({
        name: field?.slug,
        type: field?.type,
        required: field?.required,
      })),
    });
  }

  if (current_get_index !== -1) {
    const current_get = currentTableDocs[current_get_index];

    if (!current_get?.ignore) {
      currentTableDocs[current_get_index].query = [
        {
          name: "filters",
          type: "string",
          required: false,
        },
        {
          name: "sort",
          type: "string",
          required: false,
        },
        {
          name: "page",
          type: "number",
          required: false,
        },
        {
          name: "pageSize",
          type: "number",
          required: false,
        },
      ];
    }
  } else {
    currentTableDocs.push({
      method: "GET",
      path: `/api/tables/${table_name}`,
      query: [
        {
          name: "filters",
          type: "string",
          required: false,
        },
        {
          name: "sort",
          type: "string",
          required: false,
        },
        {
          name: "page",
          type: "number",
          required: false,
        },
        {
          name: "pageSize",
          type: "number",
          required: false,
        },
      ],
    });
  }

  if (current_put_index !== -1) {
    const current_put = currentTableDocs[current_put_index];

    if (!current_put?.ignore) {
      currentTableDocs[current_put_index].body = fields?.map((field) => ({
        name: field?.slug,
        type: field?.type,
        required: field?.required,
      }));
    }
  } else {
    currentTableDocs.push({
      method: "PUT",
      path: `/api/tables/${table_name}/:id`,
      body: fields?.map((field) => ({
        name: field?.slug,
        type: field?.type,
        required: field?.required,
      })),
    });
  }

  if (current_delete_index !== -1) {
    const current_delete = currentTableDocs[current_delete_index];

    if (!current_delete?.ignore) {
    }
  } else {
    currentTableDocs.push({
      method: "DELETE",
      path: `/api/tables/${table_name}/:id`,
    });
  }

  return currentTableDocs;
};

const pushAll = async (table_path, regenerate = false) => {
  try {
    const docsPath = path.join(table_path, "docs", "index.json");

    if (!regenerate && !!fs_sys.existsSync(docsPath)) {
      return;
    }

    const table_name = table_path.split("/").pop();

    const table = fs.getSchema(table_name);

    const content = getTemplate(table_name, table?.fields);

    await fs_promise.mkdir(path.join(table_path, "docs"), {
      recursive: true,
    });

    await fs_promise.writeFile(docsPath, JSON.stringify(content, null, 2));

    return content;
  } catch (err) {
    console.error(err);
  }
};

export default pushAll;
