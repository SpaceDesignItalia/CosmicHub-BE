const Warehouse = require("../Models/WarehouseModel");

class WarehouseController {
  // Recupera tutti i magazzini
  static async GetAllWarehouses(req, res, db) {
    try {
      const warehouses = await Warehouse.GetAllWarehouses(db);
      res.status(200).json(warehouses);
    } catch (error) {
      console.error("Errore nel recupero dei magazzini:", error);
      res.status(500).json({ error: "Errore nel recupero dei magazzini" });
    }
  }

  // Recupera un magazzino per ID
  static async GetWarehouseById(req, res, db) {
    try {
      const warehouseId = req.query.warehouse_id;
      const warehouse = await Warehouse.GetWarehouseById(db, warehouseId);
      if (!warehouse) {
        return res.status(404).json({ error: "Magazzino non trovato" });
      }
      res.status(200).json(warehouse);
    } catch (error) {
      console.error("Errore nel recupero del magazzino:", error);
      res.status(500).json({ error: "Errore nel recupero del magazzino" });
    }
  }

  // Recupera un magazzino per UUID
  static async GetWarehouseByUUID(req, res, db) {
    try {
      const warehouseUUID = req.query.warehouse_uuid;
      const warehouse = await Warehouse.GetWarehouseByUUID(db, warehouseUUID);
      if (!warehouse) {
        return res.status(404).json({ error: "Magazzino non trovato" });
      }
      res.status(200).json(warehouse);
    } catch (error) {
      console.error("Errore nel recupero del magazzino:", error);
      res.status(500).json({ error: "Errore nel recupero del magazzino" });
    }
  }

  // Recupera un magazzino per codice
  static async GetWarehouseByCode(req, res, db) {
    try {
      const warehouseCode = req.query.warehouse_code;
      const warehouse = await Warehouse.GetWarehouseByCode(db, warehouseCode);
      if (!warehouse) {
        return res.status(404).json({ error: "Magazzino non trovato" });
      }
      res.status(200).json(warehouse);
    } catch (error) {
      console.error("Errore nel recupero del magazzino:", error);
      res.status(500).json({ error: "Errore nel recupero del magazzino" });
    }
  }

  // Recupera i magazzini per ID azienda
  static async GetWarehousesByCompanyId(req, res, db) {
    try {
      const companyId = req.query.company_id;
      const warehouses = await Warehouse.GetWarehousesByCompanyId(
        db,
        companyId
      );
      res.status(200).json(warehouses);
    } catch (error) {
      console.error("Errore nel recupero dei magazzini dell'azienda:", error);
      res
        .status(500)
        .json({ error: "Errore nel recupero dei magazzini dell'azienda" });
    }
  }

  // Crea un nuovo magazzino
  static async CreateWarehouse(req, res, db) {
    try {
      const warehouseData = req.body;

      console.log(warehouseData);

      // Validazione dei dati di base
      if (!warehouseData.WarehouseName) {
        return res
          .status(400)
          .json({ error: "Nome del magazzino obbligatorio" });
      }

      const newWarehouse = await Warehouse.CreateWarehouse(db, warehouseData);
      res.status(201).json(newWarehouse);
    } catch (error) {
      console.error("Errore nella creazione del magazzino:", error);
      res.status(500).json({ error: "Errore nella creazione del magazzino" });
    }
  }

  // Aggiorna un magazzino esistente
  static async UpdateWarehouse(req, res, db) {
    try {
      const warehouseUUID = req.body.warehouse_uuid;
      const warehouseData = req.body;

      if (!warehouseUUID) {
        return res.status(400).json({ error: "UUID magazzino mancante" });
      }

      // Verifica che il magazzino esista
      const existingWarehouse = await Warehouse.GetWarehouseByUUID(
        db,
        warehouseUUID
      );
      if (!existingWarehouse) {
        return res.status(404).json({ error: "Magazzino non trovato" });
      }

      const updatedWarehouse = await Warehouse.UpdateWarehouseByUUID(
        db,
        warehouseUUID,
        warehouseData
      );
      res.status(200).json(updatedWarehouse);
    } catch (error) {
      console.error("Errore nell'aggiornamento del magazzino:", error);
      res
        .status(500)
        .json({ error: "Errore nell'aggiornamento del magazzino" });
    }
  }

  // Disattiva un magazzino (soft delete)
  static async DeactivateWarehouse(req, res, db) {
    try {
      const warehouseUUID = req.query.warehouse_uuid;

      if (!warehouseUUID) {
        return res.status(400).json({ error: "UUID magazzino mancante" });
      }

      // Verifica che il magazzino esista
      const existingWarehouse = await Warehouse.GetWarehouseByUUID(
        db,
        warehouseUUID
      );
      if (!existingWarehouse) {
        return res.status(404).json({ error: "Magazzino non trovato" });
      }

      const deactivatedWarehouse = await Warehouse.DeactivateWarehouseByUUID(
        db,
        warehouseUUID
      );
      res.status(200).json({
        message: "Magazzino disattivato con successo",
        data: deactivatedWarehouse,
      });
    } catch (error) {
      console.error("Errore nella disattivazione del magazzino:", error);
      res
        .status(500)
        .json({ error: "Errore nella disattivazione del magazzino" });
    }
  }

  // Elimina definitivamente un magazzino
  static async DeleteWarehouse(req, res, db) {
    try {
      const warehouseUUID = req.query.warehouse_uuid;

      if (!warehouseUUID) {
        return res.status(400).json({ error: "UUID magazzino mancante" });
      }

      // Verifica che il magazzino esista
      const existingWarehouse = await Warehouse.GetWarehouseByUUID(
        db,
        warehouseUUID
      );
      if (!existingWarehouse) {
        return res.status(404).json({ error: "Magazzino non trovato" });
      }

      const deletedWarehouse = await Warehouse.DeleteWarehouseByUUID(
        db,
        warehouseUUID
      );
      res.status(200).json({
        message: "Magazzino eliminato permanentemente con successo",
        data: deletedWarehouse,
      });
    } catch (error) {
      console.error("Errore nell'eliminazione del magazzino:", error);
      res.status(500).json({ error: "Errore nell'eliminazione del magazzino" });
    }
  }
}

module.exports = WarehouseController;
