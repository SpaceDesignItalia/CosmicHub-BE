// documentPOST.js
const express = require("express");
const router = express.Router();
const DocumentController = require("../../Controllers/DocumentController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const documentPOST = (db) => {
  router.post("/CreateDDT", authenticateMiddleware, (req, res) => {
    DocumentController.createDDT(req, res, db);
  });

  return router;
};

module.exports = documentPOST;
