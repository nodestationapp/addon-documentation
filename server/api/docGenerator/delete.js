const getTemplate = (table_name) => ({
  method: "DELETE",
  path: `/p/tables/${table_name}/:id`,
  description: "Delete an entry",
});

const get = async (table_name, content = []) => {
  try {
    const template = getTemplate(table_name);
    content.push(template);

    return content;
  } catch (err) {
    console.error(err);
  }
};

export default get;
