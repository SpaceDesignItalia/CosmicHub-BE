const express = require("express");
const router = express.Router();
const VehicleController = require("../../Controllers/VehicleController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const vehiclePOST = (db) => {
  router.post("/CreateVehicle", authenticateMiddleware, (req, res) => {
    VehicleController.createVehicle(req, res, db);
  });
  return router;
};

module.exports = vehiclePOST;
