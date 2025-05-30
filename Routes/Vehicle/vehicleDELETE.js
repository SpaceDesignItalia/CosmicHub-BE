const express = require("express");
const router = express.Router();
const VehicleController = require("../../Controllers/VehicleController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const vehicleDELETE = (db) => {
  router.delete(
    "/DeleteVehicle/:vehicle_id",
    authenticateMiddleware,
    (req, res) => {
      VehicleController.deleteVehicle(req, res, db);
    }
  );
  return router;
};

module.exports = vehicleDELETE;
