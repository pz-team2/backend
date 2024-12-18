import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GoEvent API Documentation",
      version: "1.0.0",
      description: "GoEvent API Docs",
    },
    servers: [
      {
        url: "http://localhost:3500",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./src/controllers/*.ts", "./src/routes/*.ts"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

export function setupSwagger(app: Express): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}
