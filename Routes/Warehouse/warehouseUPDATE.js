const express = require("express");
const router = express.Router();
const WarehouseController = require("../../Controllers/WarehouseController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const warehouseUPDATE = (db) => {
  // Aggiorna un magazzino esistente
  router.put("/UpdateWarehouse", authenticateMiddleware, (req, res) => {
    WarehouseController.UpdateWarehouse(req, res, db);
  });

  // Disattiva un magazzino (soft delete)
  router.put("/DeactivateWarehouse", authenticateMiddleware, (req, res) => {
    WarehouseController.DeactivateWarehouse(req, res, db);
  });

  return router;
};

module.exports = warehouseUPDATE;
