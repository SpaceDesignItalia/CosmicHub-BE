// DocumentRoutes.js
// productRoutes.js
const express = require("express");
const router = express.Router();
const documentGET = require("./documentGET");
const documentPOST = require("./documentPOST");
const documentUPDATE = require("./documentUPDATE");
const documentDELETE = require("./documentDELETE");

const Document = (db) => {
  router.use("/GET", documentGET(db)); // Passa il database a documentGET
  router.use("/POST", documentPOST(db)); // Passa il database a documentPOST
  router.use("/UPDATE", documentUPDATE(db)); // Passa il database a documentUPDATE
  router.use("/DELETE", documentDELETE(db)); // Passa il database a documentDELETE
  return router;
};

module.exports = Document;
