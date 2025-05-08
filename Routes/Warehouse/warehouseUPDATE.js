const express = require("express");
const router = express.Router();
const WarehouseController = require("../../Controllers/WarehouseController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const warehouseUPDATE = (db) => {
  // Aggiorna un magazzino esistente
  router.put("/UpdateWarehouse", authenticateMiddleware, (req, res) => {
    WarehouseController.UpdateWarehouse(req, res, db);
  });

  // Aggiorna un veicolo esistente
  router.put("/UpdateVehicle", authenticateMiddleware, (req, res) => {
    WarehouseController.UpdateVehicle(req, res, db);
  });

  return router;
};

module.exports = warehouseUPDATE;
