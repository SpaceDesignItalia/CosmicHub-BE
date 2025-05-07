// companyRoutes.js
const express = require("express");
const router = express.Router();
const companyGET = require("./companyGET");

const Company = (db) => {
  router.use("/GET", companyGET(db)); // Passa il database a companyGET
  return router;
};

module.exports = Company;
