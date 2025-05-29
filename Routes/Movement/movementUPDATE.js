// movementUPDATE.js
const express = require("express");
const router = express.Router();
const MovementController = require("../../Controllers/MovementController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const movementUPDATE = (db) => {
  // Aggiorna un movimento esistente
  router.put("/UpdateMovement/:id", authenticateMiddleware, (req, res) => {
    MovementController.updateMovement(req, res, db);
  });

  return router;
};

module.exports = movementUPDATE;
