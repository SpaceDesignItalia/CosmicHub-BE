// authenticationRoutes.js
const express = require("express");
const router = express.Router();
const authenticationGET = require("./authenticationGET");
const authenticationPOST = require("./authenticationPOST");
const authenticationUPDATE = require("./authenticationUPDATE");

const Authentication = (db) => {
  router.use("/GET", authenticationGET(db)); // Passa il database a authenticationGET
  router.use("/POST", authenticationPOST(db)); // Passa il database a authenticationPOST
  router.use("/UPDATE", authenticationUPDATE(db)); // Passa il database a authenticationUPDATE
  return router;
};

module.exports = Authentication;
