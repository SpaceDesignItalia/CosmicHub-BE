// SupplierRoutes.js
const express = require("express");
const router = express.Router();
const supplierGET = require("./supplierGET");
const supplierPOST = require("./supplierPOST");
const supplierUPDATE = require("./supplierUPDATE");
const supplierDELETE = require("./supplierDELETE");

const Supplier = (db) => {
  router.use("/GET", supplierGET(db));
  router.use("/POST", supplierPOST(db));
  router.use("/UPDATE", supplierUPDATE(db));
  router.use("/DELETE", supplierDELETE(db));
  return router;
};

module.exports = Supplier;
