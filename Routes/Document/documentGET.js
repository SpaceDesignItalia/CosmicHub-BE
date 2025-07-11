// documentGET.js
const express = require("express");
const router = express.Router();
const DocumentController = require("../../Controllers/DocumentController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const documentGET = (db) => {
  router.get("/GetAllDDT", authenticateMiddleware, (req, res) => {
    DocumentController.getAllDDT(req, res, db);
  });

  return router;
};

module.exports = documentGET;
