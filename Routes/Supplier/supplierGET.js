// supplierGET.js
const express = require("express");
const router = express.Router();
const SupplierController = require("../../Controllers/SupplierController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const supplierGET = (db) => {
  // Definisci le route GET qui

  router.get("/GetAllSuppliers", authenticateMiddleware, (req, res) => {
    SupplierController.GetAllSuppliers(req, res, db);
  });

  router.get("/GetSupplierById/:id", authenticateMiddleware, (req, res) => {
    SupplierController.GetSupplierById(req, res, db);
  });

  router.get("/SearchSuppliers", authenticateMiddleware, (req, res) => {
    SupplierController.SearchSuppliers(req, res, db);
  });

  return router; // Ritorna il router per consentire l'utilizzo da parte dell'app principale
};

module.exports = supplierGET;
