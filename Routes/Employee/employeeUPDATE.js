const express = require("express");
const router = express.Router();
const EmployeeController = require("../../Controllers/EmployeeController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const employeeUPDATE = (db) => {
  router.put("/UpdateEmployeeData", authenticateMiddleware, (req, res) => {
    EmployeeController.updateEmployeeData(req, res, db);
  });

  router.put("/UpdateUserPassword", authenticateMiddleware, (req, res) => {
    EmployeeController.updateUserPassword(req, res, db);
  });

  router.put("/UpdateEmployeeVehicle", authenticateMiddleware, (req, res) => {
    EmployeeController.updateEmployeeVehicle(req, res, db);
  });

  return router;
};

module.exports = employeeUPDATE;
