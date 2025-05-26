// productRoutes.js
const express = require("express");
const router = express.Router();
const productGET = require("./productGET");
const productPOST = require("./productPOST");
const productUPDATE = require("./productUPDATE");

const Product = (db) => {
  router.use("/GET", productGET(db)); // Passa il database a productGET
  router.use("/POST", productPOST(db)); // Passa il database a productPOST
  router.use("/UPDATE", productUPDATE(db)); // Passa il database a productUPDATE
  return router;
};

module.exports = Product;
