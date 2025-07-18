// documentDELETE.js
const express = require("express");
const router = express.Router();
const DocumentController = require("../../Controllers/DocumentController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const documentDELETE = (db) => {
  router.delete("/DeleteDDT", authenticateMiddleware, (req, res) => {
    DocumentController.deleteDDT(req, res, db);
  });

  router.delete(
    "/DeleteVehicleDocument/:document_id",
    authenticateMiddleware,
    (req, res) => {
      DocumentController.deleteVehicleDocument(req, res, db);
    }
  );

  router.delete(
    "/DeleteCompanyDocument/:document_id",
    authenticateMiddleware,
    (req, res) => {
      DocumentController.deleteCompanyDocument(req, res, db);
    }
  );

  router.delete(
    "/DeleteEmployeeDocument/:document_id",
    authenticateMiddleware,
    (req, res) => {
      DocumentController.deleteEmployeeDocument(req, res, db);
    }
  );

  return router;
};

module.exports = documentDELETE;
