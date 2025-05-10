// controller/EmployeeController.js
const Employee = require("../Models/EmployeeModel");

class EmployeeController {
  static async getAllEmployees(res, db) {
    try {
      const employees = await Employee.getAllEmployees(db);
      res.status(200).json(employees);
    } catch (error) {
      console.error("Errore nel recupero degli impiegati:", error);
      res.status(500).json({ error: "Recupero degli impiegati fallito" });
    }
  }

  static async getEmployeeById(req, res, db) {
    try {
      const employeeId = req.query.employeeId;
      const employee = await Employee.getEmployeeById(db, employeeId);
      res.status(200).json(employee);
    } catch (error) {
      console.error("Errore nel recupero dell'impiegato:", error);
      res.status(500).json({ error: "Recupero dell'impiegato fallito" });
    }
  }

  static async searchEmployee(req, res, db) {
    try {
      const searchTerm = req.query.searchTerm;
      const employees = await Employee.searchEmployee(db, searchTerm);
      res.status(200).json(employees);
    } catch (error) {
      console.error("Errore nel recupero degli impiegati:", error);
      res.status(500).json({ error: "Recupero degli impiegati fallito" });
    }
  }

  static async createNewEmployee(req, res, db) {
    try {
      const EmployeeData = req.body.EmployeeData;
      const newEmployeeId = await Employee.createNewEmployee(db, EmployeeData);
      res.status(200).json({
        message: "Impiegato registrato con successo",
        id: newEmployeeId,
      });
    } catch (error) {
      console.error("Errore nella creazione dell'impiegato:", error);
      res.status(500).json({ error: "Creazione dell'impiegato fallita" });
    }
  }

  static async updateEmployeeData(req, res, db) {
    try {
      const UserData = req.body.userData;
      const email = req.session.account.email;
      await Employee.updateEmployeeData(db, UserData, email);
      res.status(200).json({
        message: "Dati dell'impiegato aggiornati con successo",
      });
    } catch (error) {
      console.error(
        "Errore nell'aggiornamento dei dati dell'impiegato:",
        error
      );
      res
        .status(500)
        .json({ error: "Aggiornamento dei dati dell'impiegato fallito" });
    }
  }

  static async deleteEmployee(req, res, db) {
    try {
      const employeeId = req.query.employeeId;
      await Employee.deleteEmployee(db, employeeId);
      res.status(200).json({
        message: "Impiegato eliminato con successo",
      });
    } catch (error) {
      console.error("Errore nell'eliminazione dell'impiegato:", error);
      res.status(500).json({ error: "Eliminazione dell'impiegato fallita" });
    }
  }

  static async updateUserPassword(req, res, db) {
    try {
      const currentPassword = req.body.currentPassword;
      const newPassword = req.body.newPassword;
      const email = req.session.account.email;

      await Employee.updateUserPassword(
        db,
        email,
        currentPassword,
        newPassword
      );
      res.status(200).json({
        message: "Password aggiornata con successo",
      });
    } catch (error) {
      console.error(
        "Errore nell'aggiornamento della password dell'impiegato:",
        error
      );
      res
        .status(500)
        .json({ error: "Aggiornamento della password dell'impiegato fallito" });
    }
  }
}

module.exports = EmployeeController;
