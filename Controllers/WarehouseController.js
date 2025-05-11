const Warehouse = require("../Models/WarehouseModel");

class WarehouseController {
  // Recupera tutti i magazzini
  static async GetAllWarehouses(req, res, db) {
    console.log("GetAllWarehouses");
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

      // Validazione dei dati di base
      if (!warehouseData.name || !warehouseData.company_id) {
        return res
          .status(400)
          .json({ error: "Nome e ID azienda sono obbligatori" });
      }

      const newWarehouse = await Warehouse.CreateWarehouse(db, warehouseData);
      res.status(201).json(newWarehouse);
    } catch (error) {
      console.error("Errore nella creazione del magazzino:", error);
      res.status(500).json({ error: "Errore nella creazione del magazzino" });
    }
  }

  static async CreateVehicle(req, res, db) {
    try {
      const vehicleData = req.body;
      const newVehicle = await Warehouse.CreateVehicle(db, vehicleData);
      res.status(201).json(newVehicle);
    } catch (error) {
      console.error("Errore nella creazione del veicolo:", error);
      res.status(500).json({ error: "Errore nella creazione del veicolo" });
    }
  }

  // Aggiorna un magazzino esistente
  static async UpdateWarehouse(req, res, db) {
    try {
      const warehouseId = req.body.warehouse_id;
      const warehouseData = req.body;

      if (!warehouseId) {
        return res.status(400).json({ error: "ID magazzino mancante" });
      }

      // Verifica che il magazzino esista
      const existingWarehouse = await Warehouse.GetWarehouseById(
        db,
        warehouseId
      );
      if (!existingWarehouse) {
        return res.status(404).json({ error: "Magazzino non trovato" });
      }

      const updatedWarehouse = await Warehouse.UpdateWarehouse(
        db,
        warehouseId,
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

  static async UpdateVehicle(req, res, db) {
    try {
      const vehicleId = req.query.vehicleId;
      const vehicleData = req.body;

      console.log(vehicleId);
      console.log(vehicleData);

      if (!vehicleId) {
        return res.status(400).json({ error: "ID veicolo mancante" });
      }

      const existingVehicle = await Warehouse.GetVehicleById(db, vehicleId);
      if (!existingVehicle) {
        return res.status(404).json({ error: "Veicolo non trovato" });
      }

      const updatedVehicle = await Warehouse.UpdateVehicle(
        db,
        vehicleId,
        vehicleData
      );
      res.status(200).json(updatedVehicle);
    } catch (error) {
      console.error("Errore nell'aggiornamento del veicolo:", error);
      res.status(500).json({ error: "Errore nell'aggiornamento del veicolo" });
    }
  }

  // Elimina un magazzino
  static async DeleteWarehouse(req, res, db) {
    try {
      const warehouseId = req.query.warehouse_id;

      if (!warehouseId) {
        return res.status(400).json({ error: "ID magazzino mancante" });
      }

      // Verifica che il magazzino esista
      const existingWarehouse = await Warehouse.GetWarehouseById(
        db,
        warehouseId
      );
      if (!existingWarehouse) {
        return res.status(404).json({ error: "Magazzino non trovato" });
      }

      const deletedWarehouse = await Warehouse.DeleteWarehouse(db, warehouseId);
      res.status(200).json({
        message: "Magazzino eliminato con successo",
        data: deletedWarehouse,
      });
    } catch (error) {
      console.error("Errore nell'eliminazione del magazzino:", error);
      res.status(500).json({ error: "Errore nell'eliminazione del magazzino" });
    }
  }

  static async DeleteVehicle(req, res, db) {
    try {
      const vehicleId = req.query.vehicleId;
      const deletedVehicle = await Warehouse.DeleteVehicle(db, vehicleId);
      res.status(200).json({
        message: "Veicolo eliminato con successo",
        data: deletedVehicle,
      });
    } catch (error) {
      console.error("Errore nell'eliminazione del veicolo:", error);
      res.status(500).json({ error: "Errore nell'eliminazione del veicolo" });
    }
  }

  // Recupera tutti i tipi di magazzino
  static async GetAllWarehouseTypes(req, res, db) {
    try {
      const warehouseTypes = await Warehouse.GetAllWarehouseTypes(db);
      res.status(200).json(warehouseTypes);
    } catch (error) {
      console.error("Errore nel recupero dei tipi di magazzino:", error);
      res
        .status(500)
        .json({ error: "Errore nel recupero dei tipi di magazzino" });
    }
  }

  // Recupera tutti i veicoli
  static async GetAllVehicles(req, res, db) {
    try {
      const vehicles = await Warehouse.GetAllVehicles(db);
      res.status(200).json(vehicles);
    } catch (error) {
      console.error("Errore nel recupero dei veicoli:", error);
      res.status(500).json({ error: "Errore nel recupero dei veicoli" });
    }
  }

  // Recupera un veicolo per ID
  static async GetVehicleById(req, res, db) {
    try {
      const vehicleId = req.query.vehicleId;
      const vehicle = await Warehouse.GetVehicleById(db, vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Veicolo non trovato" });
      }
      res.status(200).json(vehicle);
    } catch (error) {
      console.error("Errore nel recupero del veicolo:", error);
      res.status(500).json({ error: "Errore nel recupero del veicolo" });
    }
  }

  // Recupera i veicoli per ID azienda
  static async GetVehiclesByCompanyId(req, res, db) {
    try {
      const companyId = req.query.company_id;
      const vehicles = await Warehouse.GetVehiclesByCompanyId(db, companyId);
      res.status(200).json(vehicles);
    } catch (error) {
      console.error("Errore nel recupero dei veicoli dell'azienda:", error);
      res
        .status(500)
        .json({ error: "Errore nel recupero dei veicoli dell'azienda" });
    }
  }

  static async GetEmptyVans(req, res, db) {
    try {
      const company_id = req.session.account.company_id;
      const emptyVans = await Warehouse.GetEmptyVans(db, company_id);
      res.status(200).json(emptyVans);
    } catch (error) {
      console.error("Errore nel recupero dei veicoli vuoti:", error);
      res.status(500).json({ error: "Errore nel recupero dei veicoli vuoti" });
    }
  }

  static async GetVanByUserId(req, res, db) {
    try {
      const userId = req.query.user_id;
      const van = await Warehouse.GetVanByUserId(db, userId);
      res.status(200).json(van);
    } catch (error) {
      console.error("Errore nel recupero del veicolo dell'impiegato:", error);
      res
        .status(500)
        .json({ error: "Errore nel recupero del veicolo dell'impiegato" });
    }
  }
}

module.exports = WarehouseController;
