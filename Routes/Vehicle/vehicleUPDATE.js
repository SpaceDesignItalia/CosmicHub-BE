const express = require("express");
const router = express.Router();
const VehicleController = require("../../Controllers/VehicleController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const vehicleUPDATE = (db) => {
  router.put("/UpdateVehicle", authenticateMiddleware, (req, res) => {
    VehicleController.updateVehicle(req, res, db);
  });
  return router;
};

module.exports = vehicleUPDATE;
