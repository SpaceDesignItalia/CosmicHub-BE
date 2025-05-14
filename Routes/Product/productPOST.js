// productPOST.js
const express = require("express");
const router = express.Router();
const ProductController = require("../../Controllers/ProductController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const productPOST = (db) => {
  // Definisci le route POST qui
  router.post("/CreateNewProduct", authenticateMiddleware, (req, res) => {
    ProductController.createNewProduct(req, res, db);
  });

  return router;
};

module.exports = productPOST;
