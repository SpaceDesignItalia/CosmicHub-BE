// roleGET.js
const express = require("express");
const router = express.Router();
const RoleController = require("../../Controllers/RoleController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const roleGET = (db) => {
  router.get("/GetAllRoles", authenticateMiddleware, (req, res) => {
    RoleController.getAllRoles(req, res, db);
  });

  return router;
};

module.exports = roleGET;
