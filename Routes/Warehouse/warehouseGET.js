// Routes/Warehouse/warehouseGET.js
const express = require("express");
const router = express.Router();
const WarehouseController = require("../../Controllers/WarehouseController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const warehouseGET = (db) => {
  // Recupera tutti i magazzini
  router.get("/GetAllWarehouses", authenticateMiddleware, (req, res) => {
    WarehouseController.GetAllWarehouses(req, res, db);
  });

  // Recupera un magazzino per ID
  router.get("/GetWarehouseById", authenticateMiddleware, (req, res) => {
    WarehouseController.GetWarehouseById(req, res, db);
  });

  // Recupera un magazzino per UUID
  router.get("/GetWarehouseByUUID", authenticateMiddleware, (req, res) => {
    WarehouseController.GetWarehouseByUUID(req, res, db);
  });

  // Recupera un magazzino per codice
  router.get("/GetWarehouseByCode", authenticateMiddleware, (req, res) => {
    WarehouseController.GetWarehouseByCode(req, res, db);
  });

  // Recupera i magazzini per ID azienda
  router.get(
    "/GetWarehousesByCompanyId",
    authenticateMiddleware,
    (req, res) => {
      WarehouseController.GetWarehousesByCompanyId(req, res, db);
    }
  );

  return router;
};

module.exports = warehouseGET;
