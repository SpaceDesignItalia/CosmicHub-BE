class WarehouseModel {
  // Recupera tutti i magazzini
  static GetAllWarehouses(db) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM public."Warehouse" 
      `;
      db.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows);
        }
      });
    });
  }

  // Recupera un magazzino per ID
  static GetWarehouseById(db, warehouseId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM public."Warehouse"
        WHERE "WarehouseID" = $1
      `;
      db.query(query, [warehouseId], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows[0]);
        }
      });
    });
  }

  // Recupera un magazzino per UUID
  static GetWarehouseByUUID(db, warehouseUUID) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM public."Warehouse"
        WHERE "WarehouseUUID" = $1 
      `;
      db.query(query, [warehouseUUID], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows[0]);
        }
      });
    });
  }

  // Recupera i magazzini per ID azienda
  static GetWarehousesByCompanyId(db, companyId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM public."Warehouse"
        WHERE company_id = $1
      `;
      db.query(query, [companyId], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows);
        }
      });
    });
  }

  // Inserisce un nuovo magazzino
  static CreateWarehouse(db, warehouseData) {
    return new Promise(async (resolve, reject) => {
      try {
        const query = `
          INSERT INTO public."Warehouse"
          ("WarehouseName", "WarehouseCode", "WarehouseCountry", "WarehouseAdress", 
           "IsActive", "CreatedBy", "CreatedAt", "UpdatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;
        const values = [
          warehouseData.WarehouseName,
          warehouseData.WarehouseCode,
          warehouseData.WarehouseCountry,
          warehouseData.WarehouseAdress,
          warehouseData.IsActive !== undefined ? warehouseData.IsActive : true,
          warehouseData.CreatedBy,
          new Date(),
          new Date(),
        ];

        const result = await db.query(query, values);
        resolve(result.rows[0]);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Aggiorna un magazzino esistente per ID
  static UpdateWarehouse(db, warehouseUUID, warehouseData) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE public."Warehouse"
        SET "WarehouseName" = $1, "WarehouseCode" = $2, "WarehouseCountry" = $3, 
            "WarehouseAdress" = $4, "IsActive" = $5, "UpdatedAt" = $6
        WHERE "WarehouseID" = $7
        RETURNING *
      `;
      const values = [
        warehouseData.WarehouseName,
        warehouseData.WarehouseCode,
        warehouseData.WarehouseCountry,
        warehouseData.WarehouseAdress,
        warehouseData.IsActive,
        new Date(),
        warehouseUUID,
      ];
      db.query(query, values, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows[0]);
        }
      });
    });
  }

  // Aggiorna un magazzino esistente per UUID
  static UpdateWarehouseByUUID(db, warehouseUUID, warehouseData) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE public."Warehouse"
        SET "WarehouseName" = $1, "WarehouseCode" = $2, "WarehouseCountry" = $3, 
            "WarehouseAdress" = $4, "IsActive" = $5, "UpdatedAt" = $6
        WHERE "WarehouseUUID" = $7
        RETURNING *
      `;
      const values = [
        warehouseData.WarehouseName,
        warehouseData.WarehouseCode,
        warehouseData.WarehouseCountry,
        warehouseData.WarehouseAdress,
        warehouseData.IsActive,
        new Date(),
        warehouseUUID,
      ];
      db.query(query, values, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows[0]);
        }
      });
    });
  }

  // Disattiva un magazzino (soft delete) per ID
  static DeactivateWarehouse(db, warehouseId) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE public."Warehouse"
        SET "IsActive" = false, "UpdatedAt" = $1
        WHERE "WarehouseID" = $2
        RETURNING *
      `;
      db.query(query, [new Date(), warehouseId], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows[0]);
        }
      });
    });
  }

  // Disattiva un magazzino (soft delete) per UUID
  static DeactivateWarehouseByUUID(db, warehouseUUID) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE public."Warehouse"
        SET "IsActive" = false, "UpdatedAt" = $1
        WHERE "WarehouseUUID" = $2
        RETURNING *
      `;
      db.query(query, [new Date(), warehouseUUID], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows[0]);
        }
      });
    });
  }

  // Elimina definitivamente un magazzino per ID
  static DeleteWarehouse(db, warehouseId) {
    return new Promise((resolve, reject) => {
      const query = `
        DELETE FROM public."Warehouse"
        WHERE "WarehouseID" = $1
        RETURNING *
      `;
      db.query(query, [warehouseId], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows[0]);
        }
      });
    });
  }

  // Elimina definitivamente un magazzino per UUID
  static DeleteWarehouseByUUID(db, warehouseUUID) {
    return new Promise((resolve, reject) => {
      const query = `
        DELETE FROM public."Warehouse"
        WHERE "WarehouseUUID" = $1
        RETURNING *
      `;
      db.query(query, [warehouseUUID], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows[0]);
        }
      });
    });
  }

  // Recupera magazzini per codice
  static GetWarehouseByCode(db, warehouseCode) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM public."Warehouse"
        WHERE "WarehouseCode" = $1
      `;
      db.query(query, [warehouseCode], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows[0]);
        }
      });
    });
  }

  static CreateNewVehicle(db, vehicleData, created_by) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO public."Vehicle" (name, license_plate, capacity, type, last_inspection, assigned_user_id, 
      location, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
      db.query(
        query,
        [
          vehicleData.name,
          vehicleData.license_plate,
          vehicleData.capacity,
          vehicleData.type,
          vehicleData.last_inspection,
          vehicleData.assigned_user_id,
          vehicleData.location,
          created_by,
        ],
        (error, result) => {
          console.log(error);
          if (error) reject(error);
          console.log(result);
          resolve(result.rows[0]);
        }
      );
    });
  }

  static GetAllVehicles(db) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM public."Vehicle"`;
      db.query(query, (error, result) => {
        if (error) reject(error);
        resolve(result.rows);
      });
    });
  }

  static DeleteVehicle(db, vehicleId) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM public."Vehicle" WHERE vehicle_id = $1 RETURNING *`;
      db.query(query, [vehicleId], (error, result) => {
        if (error) reject(error);
        resolve(result.rows[0]);
      });
    });
  }
}

module.exports = WarehouseModel;
