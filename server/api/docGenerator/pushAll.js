import fs_sys from "fs";
import path from "path";
import { fs } from "@nstation/utils";
import { promises as fs_promise } from "fs";

const getTemplate = (table_name, fields) => {
  fields = fields.filter((field) => field?.slug !== "id");

  return [
    {
      method: "POST",
      path: `/p/tables/${table_name}`,
      description: "Create an entry",
      body: fields?.map((field) => ({
        name: field?.slug,
        type: field?.type,
        required: field?.required,
      })),
    },
    {
      method: "GET",
      path: `/p/tables/${table_name}`,
      description: "Get all entries",
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
    },
    {
      method: "PUT",
      path: `/p/tables/${table_name}/:entry_id`,
      description: "Update an entry",
      body: fields?.map((field) => ({
        name: field?.slug,
        type: field?.type,
        required: field?.required,
      })),
    },
    {
      method: "DELETE",
      path: `/p/tables/${table_name}/:entry_id`,
      description: "Delete an entry",
    },
  ];
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
