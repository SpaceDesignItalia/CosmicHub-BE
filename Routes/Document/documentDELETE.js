// documentDELETE.js
const express = require("express");
const router = express.Router();
const DocumentController = require("../../Controllers/DocumentController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const documentDELETE = (db) => {
  router.delete("/DeleteDDT", authenticateMiddleware, (req, res) => {
    DocumentController.deleteDDT(req, res, db);
  });

  return router;
};

module.exports = documentDELETE;
