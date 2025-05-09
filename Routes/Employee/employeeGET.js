// customerGET.js
const express = require("express");
const router = express.Router();
const EmployeeController = require("../../Controllers/EmployeeController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const employeeGET = (db) => {
  router.get("/GetAllEmployees", authenticateMiddleware, (req, res) => {
    EmployeeController.getAllEmployees(res, db);
  });

  router.get("/GetEmployeeById", authenticateMiddleware, (req, res) => {
    EmployeeController.getEmployeeById(req, res, db);
  });

  router.get("/SearchEmployee", authenticateMiddleware, (req, res) => {
    EmployeeController.searchEmployee(req, res, db);
  });

  return router;
};

module.exports = employeeGET;
