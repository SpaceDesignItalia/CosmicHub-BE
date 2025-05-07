// controller/CompanyController.js
const Company = require("../Models/CompanyModel");

class CompanyController {
  static async GetCompanyByCompanyId(req, res, db) {
    try {
      const companyId = req.query.company_id;
      const company = await Company.GetCompanyByCompanyId(db, companyId);
      res.status(200).json(company);
    } catch (error) {
      console.error("Errore nel recupero dell'azienda:", error);
      res.status(500).json({ error: "Errore nel recupero dell'azienda" });
    }
  }
}

module.exports = CompanyController;
