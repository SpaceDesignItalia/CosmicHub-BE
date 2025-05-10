// controller/RoleController.js
const Role = require("../Models/RoleModel");

class RoleController {
  static async getAllRoles(req, res, db) {
    try {
      const roles = await Role.getAllRoles(db);
      res.status(200).json(roles);
    } catch (error) {
      console.error("Errore nel recupero dei ruoli:", error);
      res.status(500).json({ error: "Recupero dei ruoli fallito" });
    }
  }
}

module.exports = RoleController;
