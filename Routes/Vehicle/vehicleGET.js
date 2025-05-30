const express = require("express");
const router = express.Router();
const VehicleController = require("../../Controllers/VehicleController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const vehicleGET = (db) => {
  router.get("/GetAllVehicles", authenticateMiddleware, (req, res) => {
    VehicleController.getAllVehicles(req, res, db);
  });

  router.get(
    "/GetVehicleById/:vehicle_id",
    authenticateMiddleware,
    (req, res) => {
      VehicleController.getVehicleById(req, res, db);
    }
  );

  return router;
};

module.exports = vehicleGET;
