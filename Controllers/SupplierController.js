// controller/SupplierController.js
const Supplier = require("../Models/SupplierModel");

class SupplierController {
  static async GetAllSuppliers(req, res, db) {
    try {
      const suppliers = await Supplier.GetAllSuppliers(db);
      res.status(200).json(suppliers);
    } catch (error) {
      console.error("Errore nel recupero dei fornitori:", error);
      res.status(500).json({ error: "Errore nel recupero dei fornitori" });
    }
  }

  static async GetSupplierById(req, res, db) {
    try {
      const supplier_id = req.params.id;
      const supplier = await Supplier.GetSupplierById(db, supplier_id);

      if (!supplier) {
        return res.status(404).json({ error: "Fornitore non trovato" });
      }

      res.status(200).json(supplier);
    } catch (error) {
      console.error("Errore nel recupero del fornitore:", error);
      res.status(500).json({ error: "Errore nel recupero del fornitore" });
    }
  }

  static async CreateSupplier(req, res, db) {
    try {
      const user_id = req.session.account.user_id;

      // Aggiungi automaticamente il CreatedBy
      const supplierData = {
        ...req.body,
        CreatedBy: user_id,
      };

      const supplier = await Supplier.CreateSupplier(db, supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Errore nella creazione del fornitore:", error);
      res.status(500).json({ error: "Errore nella creazione del fornitore" });
    }
  }

  static async UpdateSupplier(req, res, db) {
    try {
      const supplier_id = req.params.id;
      const supplier = await Supplier.UpdateSupplier(db, supplier_id, req.body);

      if (!supplier) {
        return res.status(404).json({ error: "Fornitore non trovato" });
      }

      res.status(200).json(supplier);
    } catch (error) {
      console.error("Errore nell'aggiornamento del fornitore:", error);
      res
        .status(500)
        .json({ error: "Errore nell'aggiornamento del fornitore" });
    }
  }

  static async DeleteSupplier(req, res, db) {
    try {
      const supplier_id = req.params.id;
      const supplier = await Supplier.DeleteSupplier(db, supplier_id);

      if (!supplier) {
        return res.status(404).json({ error: "Fornitore non trovato" });
      }

      res
        .status(200)
        .json({ message: "Fornitore eliminato con successo", supplier });
    } catch (error) {
      console.error("Errore nell'eliminazione del fornitore:", error);
      res.status(500).json({ error: "Errore nell'eliminazione del fornitore" });
    }
  }

  static async SearchSuppliers(req, res, db) {
    try {
      const searchTerm = req.query.q;

      if (!searchTerm) {
        return res.status(400).json({ error: "Termine di ricerca richiesto" });
      }

      const suppliers = await Supplier.SearchSuppliers(db, searchTerm);
      res.status(200).json(suppliers);
    } catch (error) {
      console.error("Errore nella ricerca dei fornitori:", error);
      res.status(500).json({ error: "Errore nella ricerca dei fornitori" });
    }
  }
}

module.exports = SupplierController;
