// customerGET.js
const express = require("express");
const router = express.Router();
const CustomerController = require("../../Controllers/CustomerController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const customerGET = (db) => {
  // Definisci le route GET qui

  router.get("/GetAllCustomers", authenticateMiddleware, (req, res) => {
    CustomerController.GetAllCustomers(req, res, db);
  });

  return router; // Ritorna il router per consentire l'utilizzo da parte dell'app principale
};

module.exports = customerGET;
