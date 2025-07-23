function yupToOpenAPI(routes, options = {}) {
  const defaultSecuritySchemes = {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  };

  const authToSecurity = {
    admin: [{ bearerAuth: [] }],
    user: [{ bearerAuth: [] }],
  };

  function convertYupSchema(schema) {
    if (!schema) return {};

    const type = schema.type;
    const meta = schema._meta || schema.spec?.meta || {};
    const tests = schema.tests || [];

    let openApiSchema = {};

    switch (type) {
      case "string":
        openApiSchema.type = "string";
        break;
      case "number":
        openApiSchema.type = "number";
        break;
      case "boolean":
        openApiSchema.type = "boolean";
        break;
      case "object":
        openApiSchema.type = "object";

        if (meta.properties) {
          openApiSchema.properties = {};

          Object.keys(meta.properties).forEach((key) => {
            const property = meta.properties[key];
            if (property && typeof property === "object" && property.type) {
              openApiSchema.properties[key] = convertYupSchema(property);
            } else {
              openApiSchema.properties[key] = property;
            }
          });
        } else if (schema.fields) {
          openApiSchema.properties = {};
          openApiSchema.required = [];

          Object.keys(schema.fields).forEach((key) => {
            const field = schema.fields[key];
            openApiSchema.properties[key] = convertYupSchema(field);

            const fieldTests = field.tests || [];
            const isRequiredFromTests = fieldTests.some(
              (test) => test.name === "required"
            );
            const isRequiredFromSpec = field.spec?.presence === "required";
            const isRequiredFromOptional = field.spec?.optional === false;

            const isRequired =
              isRequiredFromTests ||
              isRequiredFromSpec ||
              isRequiredFromOptional;
            if (isRequired) {
              openApiSchema.required.push(key);
            }
          });

          if (openApiSchema.required.length === 0) {
            delete openApiSchema.required;
          }
        }
        break;
      case "array":
        openApiSchema.type = "array";
        if (schema.innerType) {
          openApiSchema.items = convertYupSchema(schema.innerType);
        }
        break;
    }

    if (meta.type && meta.type !== type) {
      openApiSchema.type = meta.type;
    }

    if (meta.format) {
      openApiSchema.format = meta.format;
    }

    if (meta.example !== undefined) {
      openApiSchema.example = meta.example;
    }

    if (meta.pattern !== undefined) {
      openApiSchema.pattern = meta.pattern;
    }

    if (meta.enum !== undefined) {
      openApiSchema.enum = meta.enum;
    }

    if (meta.minimum !== undefined) {
      openApiSchema.minimum = meta.minimum;
    }

    if (meta.maximum !== undefined) {
      openApiSchema.maximum = meta.maximum;
    }

    if (meta.description) {
      openApiSchema.description = meta.description;
    }

    if (tests) {
      tests.forEach((test) => {
        switch (test.name) {
          case "email":
            openApiSchema.format = "email";
            break;
          case "min":
            if (type === "string") {
              openApiSchema.minLength = test.params?.min;
            } else {
              openApiSchema.minimum = test.params?.min;
            }
            break;
          case "max":
            if (type === "string") {
              openApiSchema.maxLength = test.params?.max;
            } else {
              openApiSchema.maximum = test.params?.max;
            }
            break;
        }
      });
    }

    return openApiSchema;
  }

  let paths = {};

  routes.forEach((route) => {
    const { method, path, validation, auth } = route;
    const methodLower = method.toLowerCase();

    const openApiPath = path.replace(/:(\w+)/g, "{$1}");

    if (!paths[openApiPath]) {
      paths[openApiPath] = {};
    }

    const validationMeta = validation?._meta || validation?.spec?.meta || {};

    const endpoint = {
      tags: validationMeta.tags || ["default"],
      summary: validationMeta.summary || `${method} ${openApiPath}`,
      description: validationMeta.description || "",
      type: validationMeta.type || "application/json",
      responses: {},
    };

    if (validationMeta.operationId) {
      endpoint.operationId = validationMeta.operationId;
    }

    if (validationMeta.deprecated) {
      endpoint.deprecated = validationMeta.deprecated;
    }

    if (validationMeta.security) {
      endpoint.security = validationMeta.security;
    }

    if (validationMeta.externalDocs) {
      endpoint.externalDocs = validationMeta.externalDocs;
    }

    if (validationMeta.servers) {
      endpoint.servers = validationMeta.servers;
    }

    if (validationMeta.callbacks) {
      endpoint.callbacks = validationMeta.callbacks;
    }

    if (auth && Array.isArray(auth)) {
      endpoint.security = [];
      auth.forEach((role) => {
        if (authToSecurity[role]) {
          endpoint.security.push(...authToSecurity[role]);
        }
      });
      endpoint.security = endpoint.security.filter(
        (security, index, self) =>
          index ===
          self.findIndex((s) => JSON.stringify(s) === JSON.stringify(security))
      );
    }

    const pathParams = path.match(/:(\w+)/g);
    if (pathParams) {
      endpoint.parameters = pathParams.map((param) => ({
        name: param.slice(1),
        in: "path",
        required: true,
        schema: {
          type: "string",
        },
      }));
    }

    if (validation?.fields?.body) {
      const bodySchema = convertYupSchema(validation.fields.body);

      endpoint.requestBody = {
        required: true,
        content: {
          [endpoint.type]: {
            schema: bodySchema,
          },
        },
      };
    }

    if (validation?.fields?.query) {
      if (!endpoint.parameters) endpoint.parameters = [];

      const querySchema = validation.fields.query;
      if (querySchema.fields) {
        Object.keys(querySchema.fields).forEach((paramName) => {
          const paramSchema = querySchema.fields[paramName];
          const paramTests = paramSchema.tests || [];
          const isRequiredFromTests = paramTests.some(
            (test) => test.name === "required"
          );
          const isRequiredFromSpec = paramSchema.spec?.presence === "required";
          const isRequiredFromOptional = paramSchema.spec?.optional === false;
          const isRequired =
            isRequiredFromTests || isRequiredFromSpec || isRequiredFromOptional;

          endpoint.parameters.push({
            name: paramName,
            in: "query",
            required: isRequired,
            schema: convertYupSchema(paramSchema),
          });
        });
      }
    }

    if (validation?.fields?.response && validation.fields.response.fields) {
      Object.keys(validation.fields.response.fields).forEach((statusCode) => {
        const responseSchema = validation.fields.response.fields[statusCode];
        const responseMeta =
          responseSchema._meta || responseSchema.spec?.meta || {};

        endpoint.responses[statusCode] = {
          description: responseMeta.description || `Response ${statusCode}`,
          content: {
            "application/json": {
              schema: convertYupSchema(responseSchema),
            },
          },
        };
      });
    } else {
      endpoint.responses["200"] = {
        description: "Success",
        content: {
          "application/json": {
            schema: {
              type: "object",
            },
          },
        },
      };
    }

    paths[openApiPath][methodLower] = endpoint;
  });

  return paths;
}

export { yupToOpenAPI };
