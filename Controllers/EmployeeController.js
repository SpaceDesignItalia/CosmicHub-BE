// controller/EmployeeController.js
const Employee = require("../Models/EmployeeModel");

class EmployeeController {
  static async getAllEmployees(res, db) {
    try {
      const employees = await Employee.getAllEmployees(db);
      console.log(employees);

      res.status(200).json(employees);
    } catch (error) {
      console.error("Errore nel recupero degli impiegati:", error);
      res.status(500).send("Recupero degli impiegati fallito");
    }
  }

  static async getEmployeeById(req, res, db) {
    try {
      const employeeId = req.query.employeeId;
      const employee = await Employee.getEmployeeById(db, employeeId);

      res.status(200).json(employee);
    } catch (error) {
      console.error("Errore nel recupero dell'impiegato:", error);
      res.status(500).send("Recupero dell'impiegato fallito");
    }
  }

  static async searchEmployee(req, res, db) {
    try {
      const searchTerm = req.query.searchTerm;

      const employees = await Employee.searchEmployee(db, searchTerm);

      res.status(200).json(employees);
    } catch (error) {
      console.error("Errore nel recupero degli impiegati:", error);
      res.status(500).send("Recupero degli impiegati fallito");
    }
  }

  static async createNewEmployee(req, res, db) {
    try {
      const EmployeeData = req.body.EmployeeData;

      const newEmployeeId = await Employee.createNewEmployee(db, EmployeeData);
      res.status(200).json({
        message: "Impiegato registrato con successo",
      });
    } catch (error) {
      console.error("Errore nella creazione dell'impiegato:", error);
      res.status(500).send("Creazione dell'impiegato fallita");
    }
  }

  static async updateEmployeeData(req, res, db) {
    try {
      const EmployeeData = req.body.employeeData;

      await Employee.updateEmployeeData(db, EmployeeData);

      res.status(200).json({
        message: "Dati dell'impiegato aggiornati con successo",
      });
    } catch (error) {
      console.error("Errore nell'aggiornamento dei dati dell'impiegato:", error);
      res.status(500).send("Aggiornamento dei dati dell'impiegato fallito");
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
      res.status(500).send("Eliminazione dell'impiegato fallita");
    }
  }
}

module.exports = EmployeeController;
