// documentGET.js
const express = require("express");
const router = express.Router();
const DocumentController = require("../../Controllers/DocumentController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const documentGET = (db) => {
  router.get("/GetAllDDT", authenticateMiddleware, (req, res) => {
    DocumentController.getAllDDT(req, res, db);
  });

  router.get("/GetAllVehicleDocuments", authenticateMiddleware, (req, res) => {
    DocumentController.getAllVehicleDocuments(req, res, db);
  });

  router.get(
    "/DownloadDocument/:document_id",
    authenticateMiddleware,
    (req, res) => {
      DocumentController.downloadDocument(req, res, db);
    }
  );

  router.get("/GetAllCompanyDocuments", authenticateMiddleware, (req, res) => {
    DocumentController.getAllCompanyDocuments(req, res, db);
  });

  router.get(
    "/DownloadCompanyDocument/:document_id",
    authenticateMiddleware,
    (req, res) => {
      DocumentController.downloadCompanyDocument(req, res, db);
    }
  );

  router.get("/GetAllEmployeeDocuments", authenticateMiddleware, (req, res) => {
    DocumentController.getAllEmployeeDocuments(req, res, db);
  });

  router.get(
    "/DownloadEmployeeDocument/:document_id",
    authenticateMiddleware,
    (req, res) => {
      DocumentController.downloadEmployeeDocument(req, res, db);
    }
  );

  return router;
};

module.exports = documentGET;
