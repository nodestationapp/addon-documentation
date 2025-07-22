// import TableDoc from "./components/TableDoc.js";

export default {
  register(app) {
    app.addMenuLink({
      to: `${process.env.PUBLIC_URL}/api-docs`,
      label: "Documentation",
      placement: "bottom",
      target: "_blank",
      order: 2,
      icon: "lucide:book-text",
    });
  },
};
