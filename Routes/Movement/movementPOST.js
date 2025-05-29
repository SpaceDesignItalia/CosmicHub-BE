// movementPOST.js
const express = require("express");
const router = express.Router();
const MovementController = require("../../Controllers/MovementController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const movementPOST = (db) => {
  // Crea un nuovo movimento di carico (da fornitore a magazzino)
  router.post("/CreateLoadMovement", authenticateMiddleware, (req, res) => {
    MovementController.createLoadMovement(req, res, db);
  });

  // Crea un nuovo movimento di scarico (da magazzino)
  router.post("/CreateUnloadMovement", authenticateMiddleware, (req, res) => {
    MovementController.createUnloadMovement(req, res, db);
  });

  // Crea un nuovo movimento di trasferimento (tra magazzini o veicoli)
  router.post("/CreateTransferMovement", authenticateMiddleware, (req, res) => {
    MovementController.createTransferMovement(req, res, db);
  });

  // Crea un movimento generico
  router.post("/CreateMovement", authenticateMiddleware, (req, res) => {
    MovementController.createMovement(req, res, db);
  });

  return router;
};

module.exports = movementPOST;
