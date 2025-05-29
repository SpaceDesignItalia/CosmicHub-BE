// Movement.js
const express = require("express");
const router = express.Router();
const movementGET = require("./movementGET");
const movementPOST = require("./movementPOST");
const movementUPDATE = require("./movementUPDATE");
const movementDELETE = require("./movementDELETE");

const Movement = (db) => {
  router.use("/GET", movementGET(db));
  router.use("/POST", movementPOST(db));
  router.use("/UPDATE", movementUPDATE(db));
  router.use("/DELETE", movementDELETE(db));
  return router;
};

module.exports = Movement;
