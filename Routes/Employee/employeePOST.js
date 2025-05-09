// customerPOST.js
const express = require("express");
const router = express.Router();
const EmployeeController = require("../../Controllers/EmployeeController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const employeePOST = (db) => {
  // Definisci le route POST qui
  router.post("/CreateNewEmployee", authenticateMiddleware, (req, res) => {
    EmployeeController.createNewEmployee(req, res, db);
  });

  return router;
};
  
module.exports = employeePOST;
