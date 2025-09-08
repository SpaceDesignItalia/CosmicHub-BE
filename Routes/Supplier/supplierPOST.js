// supplierPOST.js
const express = require("express");
const router = express.Router();
const SupplierController = require("../../Controllers/SupplierController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const supplierPOST = (db) => {
  // Definisci le route POST qui
  router.post("/CreateSupplier", authenticateMiddleware, (req, res) => {
    SupplierController.CreateSupplier(req, res, db);
  });

  return router; // Ritorna il router per consentire l'utilizzo da parte dell'app principale
};

module.exports = supplierPOST;
