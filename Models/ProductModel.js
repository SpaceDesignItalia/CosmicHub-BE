// productModel.js

class ProductModel {
  static async getAllCategories(db) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT "Category_Attribute"."name", "Category_Attribute"."type", "Category"."name" AS "category_name", "Category_Attribute"."attribute_id", "Category"."category_id", "Category_Attribute"."isRequired" FROM public."Category_Attribute"
        RIGHT JOIN public."Category" USING(category_id)`,
        (err, result) => {
          if (err) {
            console.error("Errore nella query getAllCategories:", err);
            reject(err);
            return;
          }
          resolve(result.rows);
        }
      );
    });
  }

  static async getProductsByWarehouse(db, warehouse_id) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM public."Product" WHERE warehouse_id = $1`,
        [warehouse_id],
        (err, result) => {
          if (err) {
            console.error("Errore nella query getProductsByWarehouse:", err);
            reject(err);
            return;
          }
          resolve(result.rows);
        }
      );
    });
  }

  static async createNewProduct(db, data, company_id, created_by) {
    return new Promise((resolve, reject) => {
      const categoryQuery = `SELECT "Category"."category_id" FROM public."Category"
      WHERE "Category"."name" = $1 AND "Category"."company_id" = $2`;
      db.query(categoryQuery, [data.category, company_id], (err, result) => {
        if (err) {
          console.error("Errore nella query categoria:", err);
          reject(err);
          return;
        }
        if (!result.rows || result.rows.length === 0) {
          reject(
            new Error(
              `Categoria '${data.category}' non trovata per questa azienda`
            )
          );
          return;
        }
        const productQuery = `INSERT INTO public."Product" (name, company_id, category_id, sku, description, 
        price, min_stock_treshold, barcode, qr_code, supplier_id, brand_id, weight, dimensions, location, notes, cost_price, 
        vat_rate, reorder_quantity, stock_unit, warehouse_id, created_by) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING product_id`;
        db.query(
          productQuery,
          [
            data.name || null,
            company_id,
            result.rows[0].category_id,
            data.sku || null,
            data.description || null,
            data.price || null,
            data.minStockThreshold || null,
            data.barcode || null,
            data.qrCode || null,
            data.supplier || null,
            data.brand || null,
            data.weight || null,
            data.dimensions || null,
            data.location || null,
            data.notes || null,
            data.costPrice || null,
            data.vatRate || null,
            data.reorderQuantity || null,
            data.stockUnit || null,
            data.warehouse || null,
            created_by,
          ],
          (err, result) => {
            console.log(err, result);
            if (err) {
              console.error("Errore nell'inserimento del prodotto:", err);
              reject(err);
              return;
            }
            if (!result.rows || result.rows.length === 0) {
              reject(
                new Error(
                  "Errore nell'inserimento del prodotto: nessun ID restituito"
                )
              );
              return;
            }
            const product_id = result.rows[0].product_id;

            // Se non ci sono attributi, risolvi immediatamente
            if (!data.attributes || data.attributes.length === 0) {
              resolve({
                product_id: product_id,
                message: "Prodotto creato con successo",
              });
              return;
            }

            const attributesQuery = `INSERT INTO public."Attribute" (name, data_type, value, is_required, created_by, product_id) VALUES ($1, $2, $3, $4, $5, $6)`;
            let attributesProcessed = 0;

            data.attributes.forEach((attribute) => {
              db.query(
                attributesQuery,
                [
                  attribute.name,
                  attribute.type,
                  attribute.value,
                  attribute.isRequired,
                  created_by,
                  product_id,
                ],
                (err, result) => {
                  if (err) reject(err);
                  attributesProcessed++;
                  if (attributesProcessed === data.attributes.length) {
                    resolve({
                      product_id: product_id,
                      message: "Prodotto e attributi creati con successo",
                    });
                  }
                }
              );
            });
          }
        );
      });
    });
  }

  static async createNewCategory(db, name, attributes, company_id, created_by) {
    console.log(name, attributes, company_id, created_by);
    return new Promise((resolve, reject) => {
      const categoryQuery = `INSERT INTO public."Category" (name, company_id, created_by) VALUES ($1, $2, $3) RETURNING category_id`;
      db.query(categoryQuery, [name, company_id, created_by], (err, result) => {
        if (err) {
          console.error("Errore nell'inserimento della categoria:", err);
          reject(err);
          return;
        }
        if (!result.rows || result.rows.length === 0) {
          reject(
            new Error(
              "Errore nell'inserimento della categoria: nessun ID restituito"
            )
          );
          return;
        }
        console.log(result);

        // Se non ci sono attributi, risolvi immediatamente
        if (!attributes || attributes.length === 0) {
          resolve({
            category_id: result.rows[0].category_id,
            message: "Categoria creata con successo",
          });
          return;
        }

        let attributesProcessed = 0;
        attributes.forEach((attribute) => {
          const attributesQuery = `INSERT INTO public."Category_Attribute" (category_id, name, type, created_by) VALUES ($1, $2, $3, $4)`;
          db.query(
            attributesQuery,
            [
              result.rows[0].category_id,
              attribute.name,
              attribute.type,
              created_by,
            ],
            (err, result) => {
              if (err) reject(err);
              attributesProcessed++;
              if (attributesProcessed === attributes.length) {
                resolve({
                  category_id: result.rows[0].category_id,
                  message: "Categoria e attributi creati con successo",
                });
              }
            }
          );
        });
      });
    });
  }

  static async getAllProducts(db) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM public."Product"`, async (err, result) => {
        if (err) {
          console.error("Errore nella query getAllProducts:", err);
          reject(err);
          return;
        }

        try {
          const products = result.rows;

          // Create an array of promises for fetching attributes
          const attributePromises = products.map((product) => {
            return new Promise((resolveAttr, rejectAttr) => {
              const attributesQuery = `SELECT "Attribute"."name", "Attribute"."data_type", "Attribute"."value" 
                FROM public."Attribute"
                WHERE "Attribute"."product_id" = $1`;

              db.query(attributesQuery, [product.product_id], (err, result) => {
                if (err) rejectAttr(err);
                product.attributes = result.rows;
                resolveAttr();
              });
            });
          });

          // Wait for all attribute queries to complete
          await Promise.all(attributePromises);
          resolve(products);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  static async updateProductQuantity(db, product_id, quantity) {
    return new Promise((resolve, reject) => {
      const updateQuery = `UPDATE public."Product" SET stock_unit = $1 WHERE product_id = $2`;
      db.query(updateQuery, [quantity, product_id], (err, result) => {
        if (err) {
          console.error("Errore nell'aggiornamento della quantità:", err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }

  static async getAllProductMovements(db) {
    return new Promise((resolve, reject) => {
      const query = `SELECT 
        PM.movement_id, 
        PM.product_id, 
        PM.from_warehouse_id,
        W_from."WarehouseName" AS from_warehouse_name,
        PM.from_vehicle_id,
        V_from."name" AS from_vehicle_name,
        V_from."license_plate" AS from_vehicle_license_plate,
        PM.to_warehouse_id,
        W_to."WarehouseName" AS to_warehouse_name,
        PM.to_vehicle_id,
        V_to."name" AS to_vehicle_name,
        V_to."license_plate" AS to_vehicle_license_plate,
        PM.amount, 
        PM.movement_date, 
        PM.from_supplier,
        S."SupplierName",
        PMT.movement_name, 
        P.name AS product_name,
        P.sku,
        PM.created_by,
        CONCAT(U."name", ' ',U."surname") AS user_name
    FROM public."ProductMovement" AS PM
    INNER JOIN public."Product_Movement_Type" AS PMT USING ("movement_type_id") 
    INNER JOIN public."Product" AS P USING ("product_id")
    LEFT JOIN public."Warehouse" AS W_from ON W_from."WarehouseID" = PM.from_warehouse_id
    LEFT JOIN public."Warehouse" AS W_to ON W_to."WarehouseID" = PM.to_warehouse_id
    LEFT JOIN public."Vehicle" AS V_from ON V_from."vehicle_id" = PM.from_vehicle_id
    LEFT JOIN public."Vehicle" AS V_to ON V_to."vehicle_id" = PM.to_vehicle_id
    LEFT JOIN public."Supplier" AS S ON S."SupplierId" = PM.from_supplier
    INNER JOIN public."User" AS U ON U."user_id" = PM.created_by
    ORDER BY PM.movement_id ASC;

      `;

      db.query(query, [], (err, result) => {
        if (err) {
          console.error("Errore nella query getAllProductMovements:", err);
          reject(err);
          return;
        }
        resolve(result.rows);
      });
    });
  }
}

module.exports = ProductModel;
