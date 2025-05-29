// productUPDATE.js
const express = require("express");
const router = express.Router();
const ProductController = require("../../Controllers/ProductController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const productUPDATE = (db) => {
  router.put("/UpdateProductQuantity", authenticateMiddleware, (req, res) => {
    console.log("UpdateProductQuantity");
    ProductController.updateProductQuantity(req, res, db);
  });

  router.put("/UpdateProduct/:id", authenticateMiddleware, (req, res) => {
    ProductController.updateProduct(req, res, db);
  });

  return router;
};

module.exports = productUPDATE;
