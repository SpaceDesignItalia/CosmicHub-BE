// controller/CustomerController.js
const Customer = require("../Models/CustomerModel");

class CustomerController {
  static async GetAllCustomers(req, res, db) {
    try {
      const company_id = req.session.account.company_id;
      const customers = await Customer.GetAllCustomers(db, company_id);
      res.status(200).json(customers);
    } catch (error) {
      console.error("Errore nel recupero dei clienti:", error);
      res.status(500).json({ error: "Errore nel recupero dei clienti" });
    }
  }

  static async CreateCustomer(req, res, db) {
    try {
      const company_id = req.session.account.company_id;
      const customer = await Customer.CreateCustomer(db, company_id, req.body);
      res.status(200).json(customer);
    } catch (error) {
      console.error("Errore nella creazione del cliente:", error);
      res.status(500).json({ error: "Errore nella creazione del cliente" });
    }
  }

  static async AddEvent(req, res, db) {
    try {
      const company_id = req.session.account.company_id;
      const event = await Customer.AddEvent(db, company_id, req.body);
      res.status(200).json(event);
    } catch (error) {
      console.error("Errore nell'aggiunta dell'evento:", error);
      res.status(500).json({ error: "Errore nell'aggiunta dell'evento" });
    }
  }

  static async GetAllEvents(req, res, db) {
    try {
      const company_id = req.session.account.company_id;
      const events = await Customer.GetAllEvents(db, company_id);
      res.status(200).json(events);
    } catch (error) {
      console.error("Errore nel recupero degli eventi:", error);
      res.status(500).json({ error: "Errore nel recupero degli eventi" });
    }
  }
}

module.exports = CustomerController;
