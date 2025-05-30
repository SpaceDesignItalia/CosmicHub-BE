const express = require("express");
const router = express.Router();
const vehicleGET = require("./vehicleGET");
const vehiclePOST = require("./vehiclePOST");
const vehicleUPDATE = require("./vehicleUPDATE");
const vehicleDELETE = require("./vehicleDELETE");

const Vehicle = (db) => {
  router.use("/GET", vehicleGET(db));
  router.use("/POST", vehiclePOST(db));
  router.use("/UPDATE", vehicleUPDATE(db));
  router.use("/DELETE", vehicleDELETE(db));
  return router;
};

module.exports = Vehicle;
