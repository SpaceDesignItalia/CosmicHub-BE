class SupplierModel {
  static GetAllSuppliers(db) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM public."Supplier" ORDER BY "SupplierName" ASC`;
      db.query(query, [], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows);
        }
      });
    });
  }

  static GetSupplierById(db, supplier_id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM public."Supplier" WHERE "SupplierId" = $1`;
      db.query(query, [supplier_id], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows[0]);
        }
      });
    });
  }

  static CreateSupplier(db, supplier) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO public."Supplier"(
        "SupplierUUID",
        "SupplierName", 
        "SupplierVAT", 
        "SupplierEmail", 
        "SupplierNumber", 
        "SupplierCountry", 
        "SupplierAddress", 
        "CreatedBy",
        "CreatedAt",
        "UpdatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *`;

      db.query(
        query,
        [
          supplier.SupplierUUID || require("crypto").randomUUID(),
          supplier.SupplierName,
          supplier.SupplierVAT,
          supplier.SupplierEmail,
          supplier.SupplierNumber,
          supplier.SupplierCountry,
          supplier.SupplierAddress,
          supplier.CreatedBy,
        ],
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.rows[0]);
          }
        }
      );
    });
  }

  static UpdateSupplier(db, supplier_id, supplier) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE public."Supplier" SET 
        "SupplierName" = $1,
        "SupplierVAT" = $2,
        "SupplierEmail" = $3,
        "SupplierNumber" = $4,
        "SupplierCountry" = $5,
        "SupplierAddress" = $6,
        "UpdatedAt" = NOW()
      WHERE "SupplierId" = $7 RETURNING *`;

      db.query(
        query,
        [
          supplier.SupplierName,
          supplier.SupplierVAT,
          supplier.SupplierEmail,
          supplier.SupplierNumber,
          supplier.SupplierCountry,
          supplier.SupplierAddress,
          supplier_id,
        ],
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.rows[0]);
          }
        }
      );
    });
  }

  static DeleteSupplier(db, supplier_id) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM public."Supplier" WHERE "SupplierId" = $1 RETURNING *`;
      db.query(query, [supplier_id], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows[0]);
        }
      });
    });
  }

  static SearchSuppliers(db, searchTerm) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM public."Supplier" 
        WHERE (
          LOWER("SupplierName") LIKE LOWER($1) OR 
          LOWER("SupplierVAT") LIKE LOWER($1) OR 
          LOWER("SupplierEmail") LIKE LOWER($1) OR 
          LOWER("SupplierNumber") LIKE LOWER($1) OR 
          LOWER("SupplierCountry") LIKE LOWER($1) OR
          LOWER("SupplierAddress") LIKE LOWER($1)
        )
        ORDER BY "SupplierName" ASC`;

      const searchPattern = `%${searchTerm}%`;
      db.query(query, [searchPattern], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.rows);
        }
      });
    });
  }
}

module.exports = SupplierModel;
