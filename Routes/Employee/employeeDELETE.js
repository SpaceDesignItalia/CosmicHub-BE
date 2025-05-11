// employeeDELETE.js
const express = require("express");
const router = express.Router();
const EmployeeController = require("../../Controllers/EmployeeController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const employeeDELETE = (db) => {
  router.delete("/DeleteEmployeeVan", authenticateMiddleware, (req, res) => {
    EmployeeController.deleteEmployeeVan(req, res, db);
  });
  return router;
};

module.exports = employeeDELETE;
