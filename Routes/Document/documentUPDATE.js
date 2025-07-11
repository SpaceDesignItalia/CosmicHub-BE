// documentUPDATE.js
const express = require("express");
const router = express.Router();
const DocumentController = require("../../Controllers/DocumentController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const documentUPDATE = (db) => {
  router.put("/UpdateDDT", authenticateMiddleware, (req, res) => {
    DocumentController.updateDDT(req, res, db);
  });

  return router;
};

module.exports = documentUPDATE;
