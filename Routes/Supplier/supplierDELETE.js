// supplierDELETE.js
const express = require("express");
const router = express.Router();
const SupplierController = require("../../Controllers/SupplierController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const supplierDELETE = (db) => {
  // Definisci le route DELETE qui
  router.delete("/DeleteSupplier/:id", authenticateMiddleware, (req, res) => {
    SupplierController.DeleteSupplier(req, res, db);
  });

  return router; // Ritorna il router per consentire l'utilizzo da parte dell'app principale
};

module.exports = supplierDELETE;
