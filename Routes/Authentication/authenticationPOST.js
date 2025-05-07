// authenticationPOST.js
const express = require("express");
const router = express.Router();
const AuthenticationController = require("../../Controllers/AuthenticationController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

const authenticationPOST = (db) => {
  // Definisci le route POST qui

  router.post("/Register", (req, res) => {
    AuthenticationController.register(req, res, db);
  });

  router.post("/Login", (req, res) => {
    AuthenticationController.login(req, res, db);
  });

  router.post("/GoogleLogin", (req, res) => {
    AuthenticationController.googleLogin(req, res, db);
  });

  router.post("/PasswordRecovery", (req, res) => {
    AuthenticationController.passwordRecovery(req, res, db);
  });

  router.post("/VerifyOtp", async (req, res) => {
    AuthenticationController.verifyOtp(req, res, db);
  });

  router.post("/Logout", authenticateMiddleware, (req, res) => {
    AuthenticationController.logout(req, res);
  });

  return router; // Ritorna il router per consentire l'utilizzo da parte dell'app principale
};

module.exports = authenticationPOST;
