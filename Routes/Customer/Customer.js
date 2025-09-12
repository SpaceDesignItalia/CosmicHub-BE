// CustomerRoutes.js
const express = require("express");
const router = express.Router();
const customerGET = require("./customerGET");
const customerPOST = require("./customerPOST");
const customerUPDATE = require("./customerUPDATE");
const customerDELETE = require("./customerDELETE");

const Customer = (db) => {
  router.use("/GET", customerGET(db));
  router.use("/POST", customerPOST(db));
  router.use("/UPDATE", customerUPDATE(db));
  router.use("/DELETE", customerDELETE(db));
  return router;
};

module.exports = Customer;
