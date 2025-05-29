// movementGET.js
const express = require("express");
const router = express.Router();
const MovementController = require("../../Controllers/MovementController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const movementGET = (db) => {
  // Recupera tutti i movimenti
  router.get("/GetAllMovements", authenticateMiddleware, (req, res) => {
    MovementController.getAllMovements(req, res, db);
  });

  // Recupera un movimento per ID
  router.get("/GetMovementById/:id", authenticateMiddleware, (req, res) => {
    MovementController.getMovementById(req, res, db);
  });

  // Recupera tutti i tipi di movimento
  router.get("/GetMovementTypes", authenticateMiddleware, (req, res) => {
    MovementController.getMovementTypes(req, res, db);
  });

  // Recupera movimenti per prodotto
  router.get("/GetMovementsByProduct", authenticateMiddleware, (req, res) => {
    MovementController.getMovementsByProduct(req, res, db);
  });

  // Recupera movimenti per magazzino
  router.get("/GetMovementsByWarehouse", authenticateMiddleware, (req, res) => {
    MovementController.getMovementsByWarehouse(req, res, db);
  });

  // Recupera movimenti per tipo
  router.get("/GetMovementsByType", authenticateMiddleware, (req, res) => {
    MovementController.getMovementsByType(req, res, db);
  });

  // Recupera movimenti per data
  router.get("/GetMovementsByDate", authenticateMiddleware, (req, res) => {
    MovementController.getMovementsByDate(req, res, db);
  });

  return router;
};

module.exports = movementGET;
