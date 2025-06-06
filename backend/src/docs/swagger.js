const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CrimWatch API",
      version: "1.0.0",
      description: "API para visualização e análise de crimes georreferenciados",
    },
    servers: [{ url: "http://localhost:4000" }],
  },
  apis: ["./src/routes/*.js"], // usar JSDoc nas rotas
};

module.exports = swaggerJsdoc(options);
