// MovementController.js
const Movement = require("../Models/MovementModel");

class MovementController {
  // Recupera tutti i movimenti
  static async getAllMovements(req, res, db) {
    try {
      const company_id = req.session.account.company_id;
      const movements = await Movement.getAllMovements(db, company_id);
      res.status(200).json(movements);
    } catch (error) {
      console.error("Errore nel recupero dei movimenti:", error);
      res.status(500).json({ error: "Errore nel recupero dei movimenti" });
    }
  }

  // Recupera un movimento per ID
  static async getMovementById(req, res, db) {
    try {
      const movement_id = req.params.id;
      const company_id = req.session.account.company_id;

      if (!movement_id) {
        return res.status(400).json({ error: "ID movimento è richiesto" });
      }

      const movement = await Movement.getMovementById(
        db,
        movement_id,
        company_id
      );
      res.status(200).json(movement);
    } catch (error) {
      console.error("Errore nel recupero del movimento:", error);
      if (error.message === "Movimento non trovato o non autorizzato") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Errore nel recupero del movimento" });
      }
    }
  }

  // Recupera tutti i tipi di movimento
  static async getMovementTypes(req, res, db) {
    try {
      const movementTypes = await Movement.getMovementTypes(db);
      res.status(200).json(movementTypes);
    } catch (error) {
      console.error("Errore nel recupero dei tipi di movimento:", error);
      res
        .status(500)
        .json({ error: "Errore nel recupero dei tipi di movimento" });
    }
  }

  // Crea un movimento di carico (da fornitore a magazzino)
  static async createLoadMovement(req, res, db) {
    try {
      console.log("createLoadMovement");
      console.log(req.body);
      const data = req.body;
      const company_id = req.session.account.company_id;
      const created_by = req.session.account.user_id;

      // Normalizziamo i nomi dei campi per compatibilità
      const normalizedData = {
        product_id: data.product_id,
        amount: data.amount || data.quantity, // Accetta sia 'amount' che 'quantity'
        to_warehouse_id: data.to_warehouse_id || data.warehouse_id, // Accetta sia 'to_warehouse_id' che 'warehouse_id'
        from_supplier:
          data.from_supplier ||
          data.supplier_id ||
          data.supplier ||
          "Manual Entry", // Valore di default se non specificato
        movement_date: data.movement_date || data.timestamp || data.created_at,
        notes: data.notes,
        reason: data.reason,
      };

      // Validazione per movimento di carico (from_supplier ora è opzionale)
      if (
        !normalizedData.product_id ||
        !normalizedData.to_warehouse_id ||
        !normalizedData.amount
      ) {
        return res.status(400).json({
          error:
            "product_id, to_warehouse_id/warehouse_id e amount/quantity sono richiesti per il carico",
        });
      }

      // Convertiamo il warehouse identifier in ID se necessario
      let warehouseId = normalizedData.to_warehouse_id;
      if (isNaN(warehouseId)) {
        // Se non è un numero, proviamo a convertirlo dal nome/codice
        warehouseId = await Movement.getWarehouseIdByNameOrCode(
          db,
          normalizedData.to_warehouse_id
        );
        if (!warehouseId) {
          return res.status(400).json({
            error: `Magazzino '${normalizedData.to_warehouse_id}' non trovato`,
          });
        }
      }

      const movementData = {
        ...normalizedData,
        to_warehouse_id: warehouseId,
        movement_type_id: 1, // Carico
        from_warehouse_id: null,
        from_vehicle_id: null,
        to_vehicle_id: null,
      };

      const movement = await Movement.createMovement(
        db,
        movementData,
        company_id,
        created_by
      );
      res.status(201).json(movement);
    } catch (error) {
      console.error("Errore nella creazione del movimento di carico:", error);
      console.error("Stack trace:", error.stack);
      res.status(500).json({
        error: "Errore nella creazione del movimento di carico",
        details: error.message,
      });
    }
  }

  // Crea un movimento di scarico (da magazzino)
  static async createUnloadMovement(req, res, db) {
    try {
      console.log(req.body);
      const data = req.body;
      const company_id = req.session.account.company_id;
      const created_by = req.session.account.user_id;

      // Normalizziamo i nomi dei campi per compatibilità
      const normalizedData = {
        product_id: data.product_id,
        amount: data.amount || data.quantity, // Accetta sia 'amount' che 'quantity'
        from_warehouse_id: data.from_warehouse_id || data.warehouse_id, // Accetta sia 'from_warehouse_id' che 'warehouse_id'
        movement_date: data.movement_date || data.timestamp || data.created_at,
        notes: data.notes,
        reason: data.reason,
      };

      // Validazione per movimento di scarico
      if (
        !normalizedData.product_id ||
        !normalizedData.from_warehouse_id ||
        !normalizedData.amount
      ) {
        return res.status(400).json({
          error:
            "product_id, from_warehouse_id/warehouse_id e amount/quantity sono richiesti per lo scarico",
        });
      }

      // Convertiamo il warehouse identifier in ID se necessario
      let warehouseId = normalizedData.from_warehouse_id;
      if (isNaN(warehouseId)) {
        // Se non è un numero, proviamo a convertirlo dal nome/codice
        warehouseId = await Movement.getWarehouseIdByNameOrCode(
          db,
          normalizedData.from_warehouse_id
        );
        if (!warehouseId) {
          return res.status(400).json({
            error: `Magazzino '${normalizedData.from_warehouse_id}' non trovato`,
          });
        }
      }

      const movementData = {
        ...normalizedData,
        from_warehouse_id: warehouseId,
        movement_type_id: 2, // Scarico
        to_warehouse_id: null,
        from_vehicle_id: null,
        to_vehicle_id: null,
        from_supplier: null,
      };

      const movement = await Movement.createMovement(
        db,
        movementData,
        company_id,
        created_by
      );
      res.status(201).json(movement);
    } catch (error) {
      console.error("Errore nella creazione del movimento di scarico:", error);
      console.error("Stack trace:", error.stack);
      res.status(500).json({
        error: "Errore nella creazione del movimento di scarico",
        details: error.message,
      });
    }
  }

  // Crea un movimento di trasferimento
  static async createTransferMovement(req, res, db) {
    try {
      const data = req.body;
      const company_id = req.session.account.company_id;
      const created_by = req.session.account.user_id;

      // Normalizziamo i nomi dei campi per compatibilità
      const normalizedData = {
        product_id: data.product_id,
        amount: data.amount || data.quantity, // Accetta sia 'amount' che 'quantity'
        from_warehouse_id: data.from_warehouse_id,
        to_warehouse_id: data.to_warehouse_id,
        from_vehicle_id: data.from_vehicle_id,
        to_vehicle_id: data.to_vehicle_id,
        movement_date: data.movement_date || data.timestamp || data.created_at,
        notes: data.notes,
        reason: data.reason,
      };

      // Validazione per movimento di trasferimento
      if (!normalizedData.product_id || !normalizedData.amount) {
        return res.status(400).json({
          error:
            "product_id e amount/quantity sono richiesti per il trasferimento",
        });
      }

      // Deve avere almeno una sorgente e una destinazione
      const hasSource =
        normalizedData.from_warehouse_id || normalizedData.from_vehicle_id;
      const hasDestination =
        normalizedData.to_warehouse_id || normalizedData.to_vehicle_id;

      if (!hasSource || !hasDestination) {
        return res.status(400).json({
          error:
            "Deve essere specificata almeno una sorgente e una destinazione per il trasferimento",
        });
      }

      const movementData = {
        ...normalizedData,
        movement_type_id: 3, // Trasferimento
        from_supplier: null,
      };

      const movement = await Movement.createMovement(
        db,
        movementData,
        company_id,
        created_by
      );
      res.status(201).json(movement);
    } catch (error) {
      console.error(
        "Errore nella creazione del movimento di trasferimento:",
        error
      );
      res.status(500).json({
        error: "Errore nella creazione del movimento di trasferimento",
      });
    }
  }

  // Crea un movimento generico
  static async createMovement(req, res, db) {
    try {
      const data = req.body;
      const company_id = req.session.account.company_id;
      const created_by = req.session.account.user_id;

      // Validazione di base
      if (!data.product_id || !data.amount || !data.movement_type_id) {
        return res.status(400).json({
          error: "product_id, amount e movement_type_id sono richiesti",
        });
      }

      const movement = await Movement.createMovement(
        db,
        data,
        company_id,
        created_by
      );
      res.status(201).json(movement);
    } catch (error) {
      console.error("Errore nella creazione del movimento:", error);
      res.status(500).json({ error: "Errore nella creazione del movimento" });
    }
  }

  // Recupera movimenti per prodotto
  static async getMovementsByProduct(req, res, db) {
    try {
      const product_id = req.query.product_id;
      const company_id = req.session.account.company_id;

      if (!product_id) {
        return res.status(400).json({ error: "product_id è richiesto" });
      }

      const movements = await Movement.getMovementsByProduct(
        db,
        product_id,
        company_id
      );
      res.status(200).json(movements);
    } catch (error) {
      console.error("Errore nel recupero dei movimenti per prodotto:", error);
      res
        .status(500)
        .json({ error: "Errore nel recupero dei movimenti per prodotto" });
    }
  }

  // Recupera movimenti per magazzino
  static async getMovementsByWarehouse(req, res, db) {
    try {
      const warehouse_id = req.query.warehouse_id;
      const company_id = req.session.account.company_id;

      if (!warehouse_id) {
        return res.status(400).json({ error: "warehouse_id è richiesto" });
      }

      const movements = await Movement.getMovementsByWarehouse(
        db,
        warehouse_id,
        company_id
      );
      res.status(200).json(movements);
    } catch (error) {
      console.error("Errore nel recupero dei movimenti per magazzino:", error);
      res
        .status(500)
        .json({ error: "Errore nel recupero dei movimenti per magazzino" });
    }
  }

  // Recupera movimenti per tipo
  static async getMovementsByType(req, res, db) {
    try {
      const movement_type_id = req.query.movement_type_id;
      const company_id = req.session.account.company_id;

      if (!movement_type_id) {
        return res.status(400).json({ error: "movement_type_id è richiesto" });
      }

      const movements = await Movement.getMovementsByType(
        db,
        movement_type_id,
        company_id
      );
      res.status(200).json(movements);
    } catch (error) {
      console.error("Errore nel recupero dei movimenti per tipo:", error);
      res
        .status(500)
        .json({ error: "Errore nel recupero dei movimenti per tipo" });
    }
  }

  // Recupera movimenti per data
  static async getMovementsByDate(req, res, db) {
    try {
      const start_date = req.query.start_date;
      const end_date = req.query.end_date;
      const company_id = req.session.account.company_id;

      if (!start_date || !end_date) {
        return res
          .status(400)
          .json({ error: "start_date e end_date sono richiesti" });
      }

      const movements = await Movement.getMovementsByDate(
        db,
        start_date,
        end_date,
        company_id
      );
      res.status(200).json(movements);
    } catch (error) {
      console.error("Errore nel recupero dei movimenti per data:", error);
      res
        .status(500)
        .json({ error: "Errore nel recupero dei movimenti per data" });
    }
  }

  // Aggiorna un movimento
  static async updateMovement(req, res, db) {
    try {
      const movement_id = req.params.id;
      const data = req.body;
      const company_id = req.session.account.company_id;
      const updated_by = req.session.account.user_id;

      if (!movement_id) {
        return res.status(400).json({ error: "ID movimento è richiesto" });
      }

      const movement = await Movement.updateMovement(
        db,
        movement_id,
        data,
        company_id,
        updated_by
      );
      res.status(200).json(movement);
    } catch (error) {
      console.error("Errore nell'aggiornamento del movimento:", error);
      if (
        error.message ===
        "Movimento non trovato o non autorizzato all'aggiornamento"
      ) {
        res.status(404).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: "Errore nell'aggiornamento del movimento" });
      }
    }
  }

  // Elimina un movimento
  static async deleteMovement(req, res, db) {
    try {
      const movement_id = req.params.id;
      const company_id = req.session.account.company_id;

      if (!movement_id) {
        return res.status(400).json({ error: "ID movimento è richiesto" });
      }

      const result = await Movement.deleteMovement(db, movement_id, company_id);
      res.status(200).json(result);
    } catch (error) {
      console.error("Errore nell'eliminazione del movimento:", error);
      if (
        error.message ===
        "Movimento non trovato o non autorizzato all'eliminazione"
      ) {
        res.status(404).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: "Errore nell'eliminazione del movimento" });
      }
    }
  }

  // Crea un movimento di carico su furgone
  static async createLoadToVehicleMovement(req, res, db) {
    try {
      console.log("createLoadToVehicleMovement");
      console.log(req.body);
      const data = req.body;
      const company_id = req.session.account.company_id;
      const created_by = req.session.account.user_id;
      if (
        !data.product_id ||
        !data.from_warehouse_id ||
        !data.to_vehicle_id ||
        !data.amount
      ) {
        return res.status(400).json({
          error:
            "product_id, from_warehouse_id, to_vehicle_id e amount sono richiesti",
        });
      }
      const result = await Movement.createLoadToVehicleMovement(
        db,
        data,
        company_id,
        created_by
      );
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        error:
          error.message ||
          "Errore nella creazione del movimento di carico su furgone",
      });
      console.error("Stack trace:", error.stack);
    }
  }
}

module.exports = MovementController;
