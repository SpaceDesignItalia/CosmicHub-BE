class WarehouseModel {
  // Recupera tutti i magazzini
  static GetAllWarehouses(db) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT w.*, wt.name as type_name 
        FROM public."Warehouse" w
        LEFT JOIN public."Warehouse_Type" wt ON w.type = wt.type_id
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
        SELECT w.*, wt.name as type_name 
        FROM public."Warehouse" w
        LEFT JOIN public."Warehouse_Type" wt ON w.type = wt.type_id
        WHERE w.warehouse_id = $1
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

  // Recupera i magazzini per ID azienda
  static GetWarehousesByCompanyId(db, companyId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT w.*, wt.name as type_name 
        FROM public."Warehouse" w
        LEFT JOIN public."Warehouse_Type" wt ON w.type = wt.type_id
        WHERE w.company_id = $1
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
        // Verifico il tipo di magazzino e recupero il type_id corrispondente
        const typeQuery = `
          SELECT type_id FROM public."Warehouse_Type" 
          WHERE name = $1
        `;

        // Determino il nome del tipo basato sull'input
        const isVehicle = warehouseData.is_vehicle || false;
        const typeName = isVehicle ? "vehicle" : "warehouse";

        const typeResult = await db.query(typeQuery, [typeName]);

        if (typeResult.rows.length === 0) {
          throw new Error(
            `Tipo di magazzino "${typeName}" non trovato nella tabella Warehouse_Type`
          );
        }

        // Uso il type_id recuperato dalla tabella Warehouse_Type
        const typeId = typeResult.rows[0].type_id;

        const query = `
          INSERT INTO public."Warehouse"
          (name, location, company_id, created_at, created_by, capacity, type, license_plate, last_inspection_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `;
        const values = [
          warehouseData.name,
          warehouseData.location,
          warehouseData.company_id,
          warehouseData.created_at || new Date(),
          warehouseData.created_by,
          warehouseData.capacity,
          typeId, // Ora usiamo il corretto type_id numerico
          warehouseData.license_plate,
          warehouseData.last_inspection_date,
        ];

        const result = await db.query(query, values);
        resolve(result.rows[0]);
      } catch (error) {
        reject(error);
      }
    });
  }

  static CreateVehicle(db, vehicleData) {
    return new Promise(async (resolve, reject) => {
      try {
        // Verifico il tipo di veicolo e recupero il type_id corrispondente
        const typeQuery = `
          SELECT type_id FROM public."Warehouse_Type"
          WHERE name = 'vehicle'
        `;

        const typeResult = await db.query(typeQuery);

        if (typeResult.rows.length === 0) {
          throw new Error(
            "Tipo di veicolo non trovato nella tabella Warehouse_Type"
          );
        }

        const typeId = typeResult.rows[0].type_id;

        const query = `
          INSERT INTO public."Warehouse"
          (name, location, company_id, created_at, created_by, capacity, type, license_plate, last_inspection)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `;
        const values = [
          vehicleData.name,
          vehicleData.location,
          vehicleData.company_id,
          vehicleData.created_at || new Date(),
          vehicleData.created_by,
          vehicleData.capacity,
          typeId,
          vehicleData.license_plate,
          vehicleData.last_inspection_date,
        ];

        const result = await db.query(query, values);
        resolve(result.rows[0]);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Aggiorna un magazzino esistente
  static UpdateWarehouse(db, warehouseId, warehouseData) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE public."Warehouse"
        SET name = $1, location = $2, company_id = $3, capacity = $4, 
            type = $5, license_plate = $6, last_inspection_date = $7
        WHERE warehouse_id = $8
        RETURNING *
      `;
      const values = [
        warehouseData.name,
        warehouseData.location,
        warehouseData.company_id,
        warehouseData.capacity,
        warehouseData.type,
        warehouseData.license_plate,
        warehouseData.last_inspection_date,
        warehouseId,
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

  // Elimina un magazzino
  static DeleteWarehouse(db, warehouseId) {
    return new Promise((resolve, reject) => {
      const query = `
        DELETE FROM public."Warehouse"
        WHERE warehouse_id = $1
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

  // Recupera tutti i tipi di magazzino
  static GetAllWarehouseTypes(db) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM public."Warehouse_Type"`;
      db.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows);
        }
      });
    });
  }

  // Recupera tutti i veicoli
  static GetAllVehicles(db) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT w.*, wt.name as type_name 
        FROM public."Warehouse" w
        JOIN public."Warehouse_Type" wt ON w.type = wt.type_id
        WHERE wt.name != 'warehouse'
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

  // Recupera i veicoli per ID azienda
  static GetVehiclesByCompanyId(db, companyId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT w.*, wt.name as type_name 
        FROM public."Warehouse" w
        JOIN public."Warehouse_Type" wt ON w.type = wt.type_id
        WHERE w.company_id = $1 AND wt.name != 'warehouse'
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

  // Recupera un veicolo per ID
  static GetVehicleById(db, vehicleId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT w.*, wt.name as type_name 
        FROM public."Warehouse" w
        JOIN public."Warehouse_Type" wt ON w.type = wt.type_id
        WHERE w.warehouse_id = $1 AND wt.name != 'warehouse'
      `;
      db.query(query, [vehicleId], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows[0]);
        }
      });
    });
  }
}

module.exports = WarehouseModel;
