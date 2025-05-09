// employeeRoutes.js
const express = require("express");
const router = express.Router();
const employeeGET = require("./employeeGET");
const employeePOST = require("./employeePOST");
const employeeUPDATE = require("./employeeUPDATE");

const Employee = (db) => {
  router.use("/GET", employeeGET(db)); // Passa il database a employeeGET
  router.use("/POST", employeePOST(db)); // Passa il database a employeePOST
  router.use("/UPDATE", employeeUPDATE(db)); // Passa il database a employeeUPDATE
  return router;
};

module.exports = Employee;
