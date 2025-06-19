const VehicleModel = require("../Models/VehicleModel");

class VehicleController {
  static async getAllVehicles(req, res, db) {
    try {
      const vehicles = await VehicleModel.getAllVehicles(db);
      res.status(200).json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Errore nel recupero dei veicoli" });
    }
  }

  static async getVehicleById(req, res, db) {
    try {
      const { vehicle_id } = req.params;
      const vehicle = await VehicleModel.getVehicleById(db, vehicle_id);
      if (!vehicle)
        return res.status(404).json({ error: "Veicolo non trovato" });
      res.status(200).json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Errore nel recupero del veicolo" });
    }
  }

  static async createVehicle(req, res, db) {
    try {
      const created_by = req.session.account.user_id;
      const vehicle = await VehicleModel.createVehicle(
        db,
        req.body,
        created_by
      );
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Errore nella creazione del veicolo" });
    }
  }

  static async updateVehicle(req, res, db) {
    try {
      const { vehicle_id } = req.params;
      const vehicle = await VehicleModel.updateVehicle(
        db,
        vehicle_id,
        req.body
      );
      if (!vehicle)
        return res
          .status(404)
          .json({ error: "Veicolo non trovato o nessun campo aggiornato" });
      res.status(200).json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Errore nell'aggiornamento del veicolo" });
    }
  }

  static async deleteVehicle(req, res, db) {
    try {
      const { vehicle_id } = req.params;
      const vehicle = await VehicleModel.deleteVehicle(db, vehicle_id);
      if (!vehicle)
        return res.status(404).json({ error: "Veicolo non trovato" });
      res.status(200).json({ message: "Veicolo eliminato", vehicle });
    } catch (error) {
      res.status(500).json({ error: "Errore nell'eliminazione del veicolo" });
    }
  }

  static async getVehicleInventory(req, res, db) {
    try {
      const { vehicle_id } = req.query;
      const vehicleInventory = await VehicleModel.getVehicleInventory(
        db,
        vehicle_id
      );
      res.status(200).json(vehicleInventory);
      console.log("vehicleInventory", vehicleInventory);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Errore nel recupero dell'inventario del veicolo" });
    }
  }

  static async deleteFromVehicleInventory(req, res, db) {
    try {
      const { product_id, amount } = req.query;
      const vehicleInventory = await VehicleModel.deleteFromVehicleInventory(
        db,
        product_id,
        amount
      );
      res.status(200).json(vehicleInventory);
    } catch (error) {}
  }
}

module.exports = VehicleController;
