const express = require("express");
const router = express.Router();
const WarehouseController = require("../../Controllers/WarehouseController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const warehousePOST = (db) => {
  // Crea un nuovo magazzino
  router.post("/CreateWarehouse", authenticateMiddleware, (req, res) => {
    WarehouseController.CreateWarehouse(req, res, db);
  });

  router.post("/CreateNewVehicle", authenticateMiddleware, (req, res) => {
    WarehouseController.CreateNewVehicle(req, res, db);
  });

  return router;
};

module.exports = warehousePOST;
