// customerDELETE.js
const express = require("express");
const router = express.Router();
const CustomerController = require("../../Controllers/CustomerController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const customerDELETE = (db) => {
  // Route per eliminare un evento
  router.delete(
    "/DeleteEvent/:event_id",
    authenticateMiddleware,
    (req, res) => {
      CustomerController.DeleteEvent(req, res, db);
    }
  );

  // Route alternativa per eliminare un evento (con ID nel body)
  router.delete("/DeleteEvent", authenticateMiddleware, (req, res) => {
    CustomerController.DeleteEvent(req, res, db);
  });

  return router; // Ritorna il router per consentire l'utilizzo da parte dell'app principale
};

module.exports = customerDELETE;
