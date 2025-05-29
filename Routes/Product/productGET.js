// productGET.js
const express = require("express");
const router = express.Router();
const ProductController = require("../../Controllers/ProductController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const productGET = (db) => {
  router.get("/GetAllCategories", authenticateMiddleware, (req, res) => {
    ProductController.getAllCategories(req, res, db);
  });

  router.get("/GetAllProducts", authenticateMiddleware, (req, res) => {
    ProductController.getAllProducts(req, res, db);
  });

  router.get("/GetProductsByWarehouse", authenticateMiddleware, (req, res) => {
    ProductController.getProductsByWarehouse(req, res, db);
  });

  router.get("/GetProductById/:id", authenticateMiddleware, (req, res) => {
    ProductController.getProductById(req, res, db);
  });

  return router;
};

module.exports = productGET;
