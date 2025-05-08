const express = require("express");
const router = express.Router();
const WarehouseController = require("../../Controllers/WarehouseController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const warehouseDELETE = (db) => {
  // Elimina un magazzino
  router.delete("/DeleteWarehouse", authenticateMiddleware, (req, res) => {
    WarehouseController.DeleteWarehouse(req, res, db);
  });

  // Elimina un veicolo
  router.delete("/DeleteVehicle", authenticateMiddleware, (req, res) => {
    WarehouseController.DeleteVehicle(req, res, db);
  });

  return router;
};

module.exports = warehouseDELETE;
