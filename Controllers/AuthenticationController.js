// controller/AuthenticationController.js
const Authentication = require("../Models/AuthenticationModel");
const EmailService = require("../middlewares/EmailService/EmailService");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//const StafferModel = require("../Models/StafferModel");
//const CustomerModel = require("../Models/CustomerModel");

class AuthenticationController {
  static async register(req, res, db) {
    try {
      const RegisterData = req.body.RegisterData;
      let account = await Authentication.register(db, RegisterData);

      // Imposta la durata del cookie di sessione
      req.session.cookie.maxAge = 60 * 60 * 1000; // 1 ora in millisecondi

      delete account.password; // Elimina la password dall'oggetto account prima di salvare nella sessione

      req.session.account = account;

      res.status(200).json({
        message: "Registrazione avvenuta con successo",
      });
    } catch (error) {
      console.error("Errore nella registrazione:", error);
      res.status(500).send("Registrazione fallita");
    }
  }

  static async login(req, res, db) {
    try {
      const LoginData = req.body.LoginData;
      let account = await Authentication.login(db, LoginData);

      // Imposta la durata del cookie di sessione
      req.session.cookie.maxAge = LoginData.rememberMe
        ? 30 * 24 * 60 * 60 * 1000 // 30 giorni in millisecondi
        : 60 * 60 * 1000; // 1 ora in millisecondi

      delete account.StafferPassword; // Elimina la password dall'oggetto account prima di salvare nella sessione

      req.session.account = account;

      res.status(200).json({
        message: "Login avvenuto con successo",
      });
    } catch (error) {
      console.error("Errore nel login:", error);
      res.status(500).send("Recupero dell'account fallito");
    }
  }

  static logout(req, res) {
    try {
      // Distruggi la sessione
      req.session.destroy((err) => {
        if (err) {
          console.error("Errore durante il logout:", err);
          return res.status(500).json({ error: "Errore interno del server" });
        }
        // Se la sessione è stata distrutta con successo, restituisci uno stato 200 (OK)
        return res
          .status(200)
          .json({ message: "Logout effettuato con successo" });
      });
    } catch (error) {
      console.error("Errore durante il logout:", error);
      return res.status(500).json({ error: "Errore interno del server" });
    }
  }

  static async GetSessionData(req, res) {
    // Verifica se la sessione è stata creata
    if (req.session.account) {
      // Verifica se l'utente è autenticato
      return res.status(200).json(req.session.account);
    } else {
      return res.status(401).json({ error: "Non autorizzato" });
    }
  }

  static async CheckSession(req, res) {
    try {
      // Verifica se la sessione è stata creata
      if (req.session.account) {
        // Verifica se l'utente è autenticato
        res.json(true);
      } else {
        res.json(false);
      }
    } catch (error) {
      console.error("Errore nel recupero della sessione:", error);
      res.status(500).send("Recupero nel recupero della sessione");
    }
  }

  static async passwordRecovery(req, res, db) {
    try {
      const Email = req.body.email;

      // Verifica se l'email esiste
      const emailExists = await StafferModel.searchStafferByEmail(db, Email);
      const emailExistsCustomer = await CustomerModel.searchCustomerByEmail(
        db,
        Email
      );
      if (
        (emailExists.length === 0 && emailExistsCustomer.length === 0) ||
        emailExistsCustomer[0]?.IsActive === false
      ) {
        return res.status(404).send("Email non trovata nel sistema.");
      }
      const recoveryCode = Math.floor(Math.random() * 900000) + 100000;

      await Authentication.passwordRecovery(
        db,
        Email,
        recoveryCode,
        emailExists,
        emailExistsCustomer
      );
      EmailService.sendPasswordRecoveryMail(Email, recoveryCode);
      res.status(200).send("codice inviato con successo.");
    } catch (error) {
      console.error("Errore nell'invio del codice:", error);
      res.status(500).send("Invio del codice fallito");
    }
  }

  static async ResetPassword(req, res, db) {
    try {
      const Email = req.body.email;
      const Code = req.body.code;
      const newPassword = req.body.newPassword;

      await Authentication.ResetPassword(db, Email, Code, newPassword);
      res.status(200).send("Password aggiornata con successo.");
    } catch (error) {
      console.error("Errore nell'aggiornamento della password:", error);
      res.status(500).send("Aggiornamento della password fallito");
    }
  }
  static async verifyOtp(req, res, db) {
    try {
      const Email = req.body.email;
      const Code = req.body.code;

      const result = await Authentication.verifyOtp(db, Email, Code);

      if (result.valid) {
        res.status(200).json({
          valid: true,
          type: result.type,
          message: "Codice OTP verificato con successo",
        });
      } else {
        res.status(400).json({
          valid: false,
          error: "Codice OTP non valido",
          type: result.type,
        });
      }
    } catch (error) {
      console.error("Errore nella verifica dell'OTP:", error);
      res.status(500).json({
        valid: false,
        error: "Errore durante la verifica dell'OTP",
      });
    }
  }

  static async googleLogin(req, res, db) {
    try {
      const { credential } = req.body;

      // Verify the Google token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      // Get or create user
      const account = await Authentication.googleLogin(db, payload);

      // Set session cookie duration
      req.session.cookie.maxAge = 60 * 60 * 1000; // 1 hour in milliseconds

      delete account.password; // Remove password from session object
      req.session.account = account;

      res.status(200).json({
        message: "Google login successful",
      });
    } catch (error) {
      console.error("Google login error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  }
}

module.exports = AuthenticationController;
