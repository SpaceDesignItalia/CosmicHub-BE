// movementDELETE.js
const express = require("express");
const router = express.Router();
const MovementController = require("../../Controllers/MovementController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const movementDELETE = (db) => {
  // Elimina un movimento
  router.delete("/DeleteMovement/:id", authenticateMiddleware, (req, res) => {
    MovementController.deleteMovement(req, res, db);
  });

  return router;
};

module.exports = movementDELETE;
