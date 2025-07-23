// CustomerRoutes.js
const express = require("express");
const router = express.Router();
const customerGET = require("./customerGET");
const customerPOST = require("./customerPOST");

const Customer = (db) => {
  router.use("/GET", customerGET(db));
  router.use("/POST", customerPOST(db));
  return router;
};

module.exports = Customer;
