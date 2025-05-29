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

  static async getProductById(db, product_id, company_id) {
    return new Promise((resolve, reject) => {
      const productQuery = `SELECT * FROM public."Product" WHERE product_id = $1 AND company_id = $2`;
      db.query(productQuery, [product_id, company_id], (err, result) => {
        if (err) {
          console.error("Errore nella query getProductById:", err);
          reject(err);
          return;
        }

        if (!result.rows || result.rows.length === 0) {
          reject(new Error("Prodotto non trovato o non autorizzato"));
          return;
        }

        const product = result.rows[0];

        // Recupero gli attributi del prodotto
        const attributesQuery = `SELECT "Attribute"."name", "Attribute"."data_type", "Attribute"."value", "Attribute"."is_required" 
          FROM public."Attribute"
          WHERE "Attribute"."product_id" = $1`;

        db.query(attributesQuery, [product_id], (err, attributesResult) => {
          if (err) {
            console.error("Errore nella query attributi:", err);
            reject(err);
            return;
          }

          product.attributes = attributesResult.rows;
          resolve(product);
        });
      });
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

  static async updateProduct(db, product_id, data, company_id, updated_by) {
    return new Promise((resolve, reject) => {
      // Prima verifico che il prodotto esista e appartenga alla company
      const checkQuery = `SELECT product_id FROM public."Product" WHERE product_id = $1 AND company_id = $2`;
      db.query(checkQuery, [product_id, company_id], (err, result) => {
        if (err) {
          console.error("Errore nella verifica del prodotto:", err);
          reject(err);
          return;
        }

        if (!result.rows || result.rows.length === 0) {
          reject(
            new Error(
              "Prodotto non trovato o non autorizzato all'aggiornamento"
            )
          );
          return;
        }

        // Se è stata fornita una categoria, verifico che esista
        if (data.category) {
          const categoryQuery = `SELECT "Category"."category_id" FROM public."Category"
            WHERE "Category"."name" = $1 AND "Category"."company_id" = $2`;
          db.query(
            categoryQuery,
            [data.category, company_id],
            (err, categoryResult) => {
              if (err) {
                console.error("Errore nella query categoria:", err);
                reject(err);
                return;
              }
              if (!categoryResult.rows || categoryResult.rows.length === 0) {
                reject(
                  new Error(
                    `Categoria '${data.category}' non trovata per questa azienda`
                  )
                );
                return;
              }

              // Procedo con l'aggiornamento includendo la categoria
              updateProductData(categoryResult.rows[0].category_id);
            }
          );
        } else {
          // Procedo con l'aggiornamento senza modificare la categoria
          updateProductData(null);
        }

        function updateProductData(category_id) {
          const updateFields = [];
          const updateValues = [];
          let paramIndex = 1;

          // Costruisco dinamicamente la query di aggiornamento
          if (data.name !== undefined) {
            updateFields.push(`name = $${paramIndex++}`);
            updateValues.push(data.name);
          }
          if (category_id !== null) {
            updateFields.push(`category_id = $${paramIndex++}`);
            updateValues.push(category_id);
          }
          if (data.sku !== undefined) {
            updateFields.push(`sku = $${paramIndex++}`);
            updateValues.push(data.sku);
          }
          if (data.description !== undefined) {
            updateFields.push(`description = $${paramIndex++}`);
            updateValues.push(data.description);
          }
          if (data.price !== undefined) {
            updateFields.push(`price = $${paramIndex++}`);
            updateValues.push(data.price);
          }
          if (data.minStockThreshold !== undefined) {
            updateFields.push(`min_stock_treshold = $${paramIndex++}`);
            updateValues.push(data.minStockThreshold);
          }
          if (data.barcode !== undefined) {
            updateFields.push(`barcode = $${paramIndex++}`);
            updateValues.push(data.barcode);
          }
          if (data.qrCode !== undefined) {
            updateFields.push(`qr_code = $${paramIndex++}`);
            updateValues.push(data.qrCode);
          }
          if (data.supplier !== undefined) {
            updateFields.push(`supplier_id = $${paramIndex++}`);
            updateValues.push(data.supplier);
          }
          if (data.brand !== undefined) {
            updateFields.push(`brand_id = $${paramIndex++}`);
            updateValues.push(data.brand);
          }
          if (data.weight !== undefined) {
            updateFields.push(`weight = $${paramIndex++}`);
            updateValues.push(data.weight);
          }
          if (data.dimensions !== undefined) {
            updateFields.push(`dimensions = $${paramIndex++}`);
            updateValues.push(data.dimensions);
          }
          if (data.location !== undefined) {
            updateFields.push(`location = $${paramIndex++}`);
            updateValues.push(data.location);
          }
          if (data.notes !== undefined) {
            updateFields.push(`notes = $${paramIndex++}`);
            updateValues.push(data.notes);
          }
          if (data.costPrice !== undefined) {
            updateFields.push(`cost_price = $${paramIndex++}`);
            updateValues.push(data.costPrice);
          }
          if (data.vatRate !== undefined) {
            updateFields.push(`vat_rate = $${paramIndex++}`);
            updateValues.push(data.vatRate);
          }
          if (data.reorderQuantity !== undefined) {
            updateFields.push(`reorder_quantity = $${paramIndex++}`);
            updateValues.push(data.reorderQuantity);
          }
          if (data.stockUnit !== undefined) {
            updateFields.push(`stock_unit = $${paramIndex++}`);
            updateValues.push(data.stockUnit);
          }
          if (data.warehouse !== undefined) {
            updateFields.push(`warehouse_id = $${paramIndex++}`);
            updateValues.push(data.warehouse);
          }

          // Aggiungo sempre updated_at e updated_by
          updateFields.push(`updated_at = NOW()`);
          updateFields.push(`updated_by = $${paramIndex++}`);
          updateValues.push(updated_by);

          // Aggiungo le condizioni WHERE
          updateValues.push(product_id);
          updateValues.push(company_id);

          if (updateFields.length === 2) {
            // Solo updated_at e updated_by
            resolve({
              product_id: product_id,
              message: "Nessun campo da aggiornare",
            });
            return;
          }

          const updateQuery = `UPDATE public."Product" SET ${updateFields.join(
            ", "
          )} 
            WHERE product_id = $${paramIndex++} AND company_id = $${paramIndex++} 
            RETURNING product_id`;

          db.query(updateQuery, updateValues, (err, updateResult) => {
            if (err) {
              console.error("Errore nell'aggiornamento del prodotto:", err);
              reject(err);
              return;
            }

            // Gestisco gli attributi se forniti
            if (data.attributes && data.attributes.length > 0) {
              // Prima elimino gli attributi esistenti
              const deleteAttributesQuery = `DELETE FROM public."Attribute" WHERE product_id = $1`;
              db.query(
                deleteAttributesQuery,
                [product_id],
                (err, deleteResult) => {
                  if (err) {
                    console.error(
                      "Errore nell'eliminazione degli attributi:",
                      err
                    );
                    reject(err);
                    return;
                  }

                  // Poi inserisco i nuovi attributi
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
                        updated_by,
                        product_id,
                      ],
                      (err, result) => {
                        if (err) {
                          reject(err);
                          return;
                        }
                        attributesProcessed++;
                        if (attributesProcessed === data.attributes.length) {
                          resolve({
                            product_id: product_id,
                            message:
                              "Prodotto e attributi aggiornati con successo",
                          });
                        }
                      }
                    );
                  });
                }
              );
            } else {
              resolve({
                product_id: product_id,
                message: "Prodotto aggiornato con successo",
              });
            }
          });
        }
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

  static async deleteProduct(db, product_id, company_id) {
    return new Promise((resolve, reject) => {
      // Prima elimino gli attributi associati al prodotto
      const deleteAttributesQuery = `DELETE FROM public."Attribute" WHERE product_id = $1`;
      db.query(deleteAttributesQuery, [product_id], (err, result) => {
        if (err) {
          console.error("Errore nell'eliminazione degli attributi:", err);
          reject(err);
          return;
        }

        // Poi elimino il prodotto, verificando che appartenga alla company corretta
        const deleteProductQuery = `DELETE FROM public."Product" WHERE product_id = $1 AND company_id = $2 RETURNING product_id`;
        db.query(
          deleteProductQuery,
          [product_id, company_id],
          (err, result) => {
            if (err) {
              console.error("Errore nell'eliminazione del prodotto:", err);
              reject(err);
              return;
            }

            if (!result.rows || result.rows.length === 0) {
              reject(
                new Error(
                  "Prodotto non trovato o non autorizzato all'eliminazione"
                )
              );
              return;
            }

            resolve({
              product_id: result.rows[0].product_id,
              message: "Prodotto eliminato con successo",
            });
          }
        );
      });
    });
  }
}

module.exports = ProductModel;
