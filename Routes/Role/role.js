// roleRoutes.js
const express = require("express");
const router = express.Router();
const roleGET = require("./roleGET");

const Role = (db) => {
  router.use("/GET", roleGET(db)); // Passa il database a roleGET
  return router;
};

module.exports = Role;
