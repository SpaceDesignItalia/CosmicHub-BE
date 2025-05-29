// productDELETE.js
const express = require("express");
const router = express.Router();
const ProductController = require("../../Controllers/ProductController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const productDELETE = (db) => {
  router.delete("/DeleteProduct/:id", authenticateMiddleware, (req, res) => {
    ProductController.deleteProduct(req, res, db);
  });

  return router;
};

module.exports = productDELETE;
