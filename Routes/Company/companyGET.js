// companyGET.js
const express = require("express");
const router = express.Router();
const CompanyController = require("../../Controllers/CompanyController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const companyGET = (db) => {
  // Definisci le route GET qui

  router.get("/GetCompanyByCompanyId", authenticateMiddleware, (req, res) => {
    CompanyController.GetCompanyByCompanyId(req, res, db);
  });

  return router; // Ritorna il router per consentire l'utilizzo da parte dell'app principale
};

module.exports = companyGET;
