// customerPOST.js
const express = require("express");
const router = express.Router();
const CustomerController = require("../../Controllers/CustomerController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const customerPOST = (db) => {
  // Definisci le route POST qui
  router.post("/CreateCustomer", authenticateMiddleware, (req, res) => {
    CustomerController.CreateCustomer(req, res, db);
  });

  router.post("/AddEvent", (req, res) => {
    CustomerController.AddEvent(req, res, db);
  });

  return router; // Ritorna il router per consentire l'utilizzo da parte dell'app principale
};

module.exports = customerPOST;
