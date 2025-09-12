// customerUPDATE.js
const express = require("express");
const router = express.Router();
const CustomerController = require("../../Controllers/CustomerController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const customerUPDATE = (db) => {
  // Route per aggiornare un evento
  router.put("/UpdateEvent/:event_id", authenticateMiddleware, (req, res) => {
    CustomerController.UpdateEvent(req, res, db);
  });

  // Route alternativa per aggiornare un evento (con ID nel body)
  router.put("/UpdateEvent", authenticateMiddleware, (req, res) => {
    CustomerController.UpdateEvent(req, res, db);
  });

  return router; // Ritorna il router per consentire l'utilizzo da parte dell'app principale
};

module.exports = customerUPDATE;
