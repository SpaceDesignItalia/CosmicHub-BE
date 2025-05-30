// Models/VehicleModel.js

class VehicleModel {
  static async getAllVehicles(db) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM public."Vehicle" ORDER BY vehicle_id ASC',
        (err, result) => {
          if (err) reject(err);
          else resolve(result.rows);
        }
      );
    });
  }

  static async getVehicleById(db, vehicle_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM public."Vehicle" WHERE vehicle_id = $1',
        [vehicle_id],
        (err, result) => {
          if (err) reject(err);
          else resolve(result.rows[0]);
        }
      );
    });
  }

  static async createVehicle(db, data, created_by) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO public."Vehicle"
        (name, license_plate, capacity, type, last_inspection, assigned_user_id, location, created_at, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
        RETURNING *
      `;
      const values = [
        data.name,
        data.license_plate,
        data.capacity,
        data.type,
        data.last_inspection,
        data.assigned_user_id,
        data.location,
        created_by,
      ];
      db.query(query, values, (err, result) => {
        if (err) reject(err);
        else resolve(result.rows[0]);
      });
    });
  }

  static async updateVehicle(db, vehicle_id, data) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      let idx = 1;
      for (const key of [
        "name",
        "license_plate",
        "capacity",
        "type",
        "last_inspection",
        "assigned_user_id",
        "location",
      ]) {
        if (data[key] !== undefined) {
          fields.push(`${key} = $${idx++}`);
          values.push(data[key]);
        }
      }
      if (fields.length === 0) return resolve(null);
      values.push(vehicle_id);
      const query = `UPDATE public."Vehicle" SET ${fields.join(
        ", "
      )} WHERE vehicle_id = $${idx} RETURNING *`;
      db.query(query, values, (err, result) => {
        if (err) reject(err);
        else resolve(result.rows[0]);
      });
    });
  }

  static async deleteVehicle(db, vehicle_id) {
    return new Promise((resolve, reject) => {
      db.query(
        'DELETE FROM public."Vehicle" WHERE vehicle_id = $1 RETURNING *',
        [vehicle_id],
        (err, result) => {
          if (err) reject(err);
          else resolve(result.rows[0]);
        }
      );
    });
  }
}

module.exports = VehicleModel;
