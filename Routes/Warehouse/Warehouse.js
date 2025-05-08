const express = require("express");
const router = express.Router();
const warehouseGET = require("./warehouseGET");
const warehousePOST = require("./warehousePOST");
const warehouseUPDATE = require("./warehouseUPDATE");
const warehouseDELETE = require("./warehouseDELETE");

const Warehouse = (db) => {
  router.use("/GET", warehouseGET(db));
  router.use("/POST", warehousePOST(db));
  router.use("/UPDATE", warehouseUPDATE(db));
  router.use("/DELETE", warehouseDELETE(db));
  return router;
};

module.exports = Warehouse;
