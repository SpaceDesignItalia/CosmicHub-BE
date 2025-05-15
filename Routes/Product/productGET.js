// productGET.js
const express = require("express");
const router = express.Router();
const ProductController = require("../../Controllers/ProductController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const productGET = (db) => {
  router.get("/GetAllCategories", authenticateMiddleware, (req, res) => {
    ProductController.getAllCategories(res, db);
  });

  return router;
};

module.exports = productGET;
