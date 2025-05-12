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

  router.get("/GetUserByVehicleId", authenticateMiddleware, (req, res) => {
    WarehouseController.GetUserByVehicleId(req, res, db);
  });

  // Recupera un magazzino per ID
  router.get("/GetWarehouseById", authenticateMiddleware, (req, res) => {
    WarehouseController.GetWarehouseById(req, res, db);
  });

  // Recupera i magazzini per ID azienda
  router.get(
    "/GetWarehousesByCompanyId",
    authenticateMiddleware,
    (req, res) => {
      WarehouseController.GetWarehousesByCompanyId(req, res, db);
    }
  );

  // Recupera tutti i tipi di magazzino
  router.get("/GetAllWarehouseTypes", authenticateMiddleware, (req, res) => {
    WarehouseController.GetAllWarehouseTypes(req, res, db);
  });

  // Recupera tutti i veicoli
  router.get("/GetAllVehicles", authenticateMiddleware, (req, res) => {
    WarehouseController.GetAllVehicles(req, res, db);
  });

  // Recupera un veicolo per ID
  router.get("/GetVehicleById", authenticateMiddleware, (req, res) => {
    WarehouseController.GetVehicleById(req, res, db);
  });

  // Recupera i veicoli per ID azienda
  router.get("/GetVehiclesByCompanyId", authenticateMiddleware, (req, res) => {
    WarehouseController.GetVehiclesByCompanyId(req, res, db);
  });

  router.get("/GetEmptyVans", authenticateMiddleware, (req, res) => {
    WarehouseController.GetEmptyVans(req, res, db);
  });

  router.get("/GetVanByUserId", authenticateMiddleware, (req, res) => {
    WarehouseController.GetVanByUserId(req, res, db);
  });
  return router;
};

module.exports = warehouseGET;
