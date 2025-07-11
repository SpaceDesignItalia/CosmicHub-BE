// DocumentController.js
const Document = require("../Models/DocumentModel");

class DocumentController {
  // Recupera tutti i documenti
  static async getAllDDT(req, res, db) {
    try {
      const company_id = req.session.account.company_id;
      const ddt = await Document.getAllDDT(db, company_id);
      res.status(200).json(ddt);
    } catch (error) {
      console.error("Errore nel recupero dei documenti:", error);
      res.status(500).json({ error: "Errore nel recupero dei documenti" });
    }
  }

  // Crea un DDT
  static async createDDT(req, res, db) {
    try {
      const company_id = req.session.account.company_id;
      const ddt = req.body;
      const ddt_id = await Document.createDDT(db, company_id, ddt);
      res.status(200).json(ddt_id);
    } catch (error) {
      console.error("Errore nella creazione del DDT:", error);
      res.status(500).json({ error: "Errore nella creazione del DDT" });
    }
  }
}

module.exports = DocumentController;
