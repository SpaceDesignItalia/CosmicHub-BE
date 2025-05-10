class RoleModel {
  static async getAllRoles(db) {
    try {
      return new Promise((resolve, reject) => {
        const query = `SELECT * FROM public."Role"`;
        db.query(query, (error, result) => {
          if (error) reject(error);
          resolve(result.rows);
        });
      });
    } catch (error) {
      console.error("Errore nel recupero dei ruoli:", error);
      throw error;
    }
  }
}

module.exports = RoleModel;
