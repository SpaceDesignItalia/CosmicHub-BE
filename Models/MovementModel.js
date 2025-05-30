// MovementModel.js

const ProductModel = require("./ProductModel");

class MovementModel {
  // Recupera tutti i movimenti di un'azienda
  static async getAllMovements(db, company_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          m.*,
          p.name as product_name,
          p.sku as product_sku,
          mt.movement_name,
          fw.WarehouseName as from_warehouse_name,
          tw.WarehouseName as to_warehouse_name
        FROM public."ProductMovement" m
        LEFT JOIN public."Product" p ON m.product_id = p.product_id
        LEFT JOIN public."Product_Movement_Type" mt ON m.movement_type_id = mt.movement_type_id
        LEFT JOIN public."Warehouse" fw ON m.from_warehouse_id = fw.WarehouseID
        LEFT JOIN public."Warehouse" tw ON m.to_warehouse_id = tw.WarehouseID
        WHERE p.company_id = $1
        ORDER BY m.movement_date DESC
      `;

      db.query(query, [company_id], (err, result) => {
        if (err) {
          console.error("Errore nella query getAllMovements:", err);
          reject(err);
          return;
        }
        resolve(result.rows);
      });
    });
  }

  // Recupera un movimento per ID
  static async getMovementById(db, movement_id, company_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          m.*,
          p.name as product_name,
          p.sku as product_sku,
          mt.movement_name,
          fw.WarehouseName as from_warehouse_name,
          tw.WarehouseName as to_warehouse_name
        FROM public."ProductMovement" m
        LEFT JOIN public."Product" p ON m.product_id = p.product_id
        LEFT JOIN public."Product_Movement_Type" mt ON m.movement_type_id = mt.movement_type_id
        LEFT JOIN public."Warehouse" fw ON m.from_warehouse_id = fw.WarehouseID
        LEFT JOIN public."Warehouse" tw ON m.to_warehouse_id = tw.WarehouseID
        WHERE m.movement_id = $1 AND p.company_id = $2
      `;

      db.query(query, [movement_id, company_id], (err, result) => {
        if (err) {
          console.error("Errore nella query getMovementById:", err);
          reject(err);
          return;
        }

        if (!result.rows || result.rows.length === 0) {
          reject(new Error("Movimento non trovato o non autorizzato"));
          return;
        }

        resolve(result.rows[0]);
      });
    });
  }

  // Recupera tutti i tipi di movimento
  static async getMovementTypes(db) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM public."Product_Movement_Type" ORDER BY movement_type_id`;

      db.query(query, (err, result) => {
        if (err) {
          console.error("Errore nella query getMovementTypes:", err);
          reject(err);
          return;
        }
        resolve(result.rows);
      });
    });
  }

  // Converte nome/codice magazzino in ID
  static async getWarehouseIdByNameOrCode(db, identifier) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT "WarehouseID" 
        FROM public."Warehouse" 
        WHERE "WarehouseName" = $1 OR "WarehouseCode" = $1 OR "WarehouseID"::text = $1
      `;

      db.query(query, [identifier], (err, result) => {
        if (err) {
          console.error("Errore nella query getWarehouseIdByNameOrCode:", err);
          reject(err);
          return;
        }

        if (result.rows && result.rows.length > 0) {
          resolve(result.rows[0].WarehouseID);
        } else {
          resolve(null);
        }
      });
    });
  }

  // Crea un nuovo movimento
  static async createMovement(db, data, company_id, created_by) {
    return new Promise((resolve, reject) => {
      // Prima verifichiamo che il prodotto appartenga alla company
      const productQuery = `SELECT product_id FROM public."Product" WHERE product_id = $1 AND company_id = $2`;

      db.query(
        productQuery,
        [data.product_id, company_id],
        (err, productResult) => {
          if (err) {
            console.error("Errore nella verifica del prodotto:", err);
            reject(err);
            return;
          }

          if (!productResult.rows || productResult.rows.length === 0) {
            reject(new Error("Prodotto non trovato o non autorizzato"));
            return;
          }

          // Gestione corretta del campo from_supplier (deve essere bigint o null)
          let fromSupplier = null;
          if (data.from_supplier !== null) {
            const supplierNum = parseInt(data.from_supplier);
            if (!isNaN(supplierNum) && supplierNum > 0) {
              fromSupplier = supplierNum;
            }
          }

          // Procediamo con l'inserimento del movimento
          const insertQuery = `
          INSERT INTO public."ProductMovement" 
          (product_id, from_warehouse_id, from_vehicle_id, to_warehouse_id, to_vehicle_id, 
           amount, movement_type_id, movement_date, from_supplier)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING movement_id
        `;

          const values = [
            data.product_id,
            data.from_warehouse_id || null,
            data.from_vehicle_id || null,
            data.to_warehouse_id || null,
            data.to_vehicle_id || null,
            data.amount,
            data.movement_type_id,
            data.movement_date || new Date(),
            fromSupplier,
          ];

          db.query(insertQuery, values, (err, result) => {
            if (err) {
              console.error("Errore nell'inserimento del movimento:", err);
              reject(err);
              return;
            }

            if (!result.rows || result.rows.length === 0) {
              reject(
                new Error(
                  "Errore nell'inserimento del movimento: nessun ID restituito"
                )
              );
              return;
            }

            const movement_id = result.rows[0].movement_id;

            // Aggiorniamo lo stock del prodotto in base al tipo di movimento
            this.updateProductStock(db, data, movement_id)
              .then(() => {
                resolve({
                  movement_id: movement_id,
                  message: "Movimento creato con successo",
                });
              })
              .catch((error) => {
                reject(error);
              });
          });
        }
      );
    });
  }

  // Aggiorna lo stock del prodotto in base al movimento
  static async updateProductStock(db, data, movement_id) {
    return new Promise(async (resolve, reject) => {
      try {
        switch (data.movement_type_id) {
          case 1: // Carico - aumenta lo stock
            const loadStockQuery = `
              UPDATE public."Product" 
              SET stock_unit = COALESCE(stock_unit, 0) + $1
              WHERE product_id = $2
            `;

            await new Promise((res, rej) => {
              db.query(
                loadStockQuery,
                [data.amount, data.product_id],
                (err, result) => {
                  if (err) {
                    console.error(
                      "Errore nell'aggiornamento dello stock (carico):",
                      err
                    );
                    rej(err);
                    return;
                  }
                  res();
                }
              );
            });
            break;

          case 2: // Scarico - diminuisce lo stock
            const unloadStockQuery = `
              UPDATE public."Product" 
              SET stock_unit = COALESCE(stock_unit, 0) - $1
              WHERE product_id = $2 AND COALESCE(stock_unit, 0) >= $1
            `;

            await new Promise((res, rej) => {
              db.query(
                unloadStockQuery,
                [data.amount, data.product_id],
                (err, result) => {
                  if (err) {
                    console.error(
                      "Errore nell'aggiornamento dello stock (scarico):",
                      err
                    );
                    rej(err);
                    return;
                  }

                  if (result.rowCount === 0) {
                    rej(
                      new Error(
                        "Stock insufficiente per il movimento di scarico"
                      )
                    );
                    return;
                  }

                  res();
                }
              );
            });
            break;

          case 3: // Trasferimento - gestisce prodotti nei magazzini
            if (!data.from_warehouse_id || !data.to_warehouse_id) {
              reject(
                new Error(
                  "Trasferimento richiede sia from_warehouse_id che to_warehouse_id"
                )
              );
              return;
            }

            // Prima recuperiamo i dati del prodotto originale
            const originalProductQuery = `
              SELECT * FROM public."Product" WHERE product_id = $1
            `;

            const originalProduct = await new Promise((res, rej) => {
              db.query(
                originalProductQuery,
                [data.product_id],
                (err, result) => {
                  if (err) {
                    rej(err);
                    return;
                  }
                  if (!result.rows || result.rows.length === 0) {
                    rej(new Error("Prodotto originale non trovato"));
                    return;
                  }
                  res(result.rows[0]);
                }
              );
            });

            // Verifica se il prodotto esiste già nel magazzino di destinazione
            const checkProductQuery = `
              SELECT product_id, stock_unit FROM public."Product" 
              WHERE (name = $1 OR sku LIKE $2) AND warehouse_id = $3
            `;

            const existingProduct = await new Promise((res, rej) => {
              db.query(
                checkProductQuery,
                [
                  originalProduct.name,
                  originalProduct.sku + "%",
                  data.to_warehouse_id,
                ],
                (err, result) => {
                  if (err) {
                    rej(err);
                    return;
                  }
                  res(
                    result.rows && result.rows.length > 0
                      ? result.rows[0]
                      : null
                  );
                }
              );
            });

            if (existingProduct) {
              // Il prodotto esiste già nel magazzino di destinazione - aggiorna quantità
              const updateQuantityQuery = `
                UPDATE public."Product" 
                SET stock_unit = COALESCE(stock_unit, 0) + $1
                WHERE product_id = $2
              `;

              await new Promise((res, rej) => {
                db.query(
                  updateQuantityQuery,
                  [data.amount, existingProduct.product_id],
                  (err, result) => {
                    if (err) {
                      rej(err);
                      return;
                    }
                    res();
                  }
                );
              });
            } else {
              // Il prodotto non esiste nel magazzino di destinazione - lo creiamo
              // Creiamo il prodotto nel magazzino di destinazione
              const createProductQuery = `
                INSERT INTO public."Product" 
                (name, company_id, category_id, sku, description, price, min_stock_treshold, 
                 barcode, qr_code, supplier_id, brand_id, weight, dimensions, location, notes, 
                 cost_price, vat_rate, reorder_quantity, stock_unit, warehouse_id, created_by) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
                RETURNING product_id
              `;

              const values = [
                originalProduct.name,
                originalProduct.company_id,
                originalProduct.category_id,
                originalProduct.sku + "_W" + data.to_warehouse_id, // SKU unico per magazzino
                originalProduct.description,
                originalProduct.price,
                originalProduct.min_stock_treshold,
                originalProduct.barcode,
                originalProduct.qr_code,
                originalProduct.supplier_id,
                originalProduct.brand_id,
                originalProduct.weight,
                originalProduct.dimensions,
                originalProduct.location,
                originalProduct.notes,
                originalProduct.cost_price,
                originalProduct.vat_rate,
                originalProduct.reorder_quantity,
                data.amount, // La quantità trasferita
                data.to_warehouse_id, // Il magazzino di destinazione
                originalProduct.created_by,
              ];

              await new Promise((res, rej) => {
                db.query(createProductQuery, values, (err, result) => {
                  if (err) {
                    rej(err);
                    return;
                  }
                  res();
                });
              });
            }

            // Sottrai la quantità dal prodotto nel magazzino di origine
            const subtractFromOriginQuery = `
              UPDATE public."Product" 
              SET stock_unit = COALESCE(stock_unit, 0) - $1
              WHERE product_id = $2 AND warehouse_id = $3 AND COALESCE(stock_unit, 0) >= $1
            `;

            await new Promise((res, rej) => {
              db.query(
                subtractFromOriginQuery,
                [data.amount, data.product_id, data.from_warehouse_id],
                (err, result) => {
                  if (err) {
                    rej(err);
                    return;
                  }

                  if (result.rowCount === 0) {
                    rej(
                      new Error(
                        "Stock insufficiente nel magazzino di origine per il trasferimento"
                      )
                    );
                    return;
                  }

                  res();
                }
              );
            });

            break;

          default:
            reject(new Error("Tipo di movimento non valido"));
            return;
        }

        resolve({
          message: "Stock aggiornato con successo",
          movement_id: movement_id,
        });
      } catch (error) {
        console.error("Errore nell'aggiornamento dello stock:", error);
        reject(error);
      }
    });
  }

  // Recupera movimenti per prodotto
  static async getMovementsByProduct(db, product_id, company_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          m.*,
          p.name as product_name,
          p.sku as product_sku,
          mt.movement_name,
          fw.WarehouseName as from_warehouse_name,
          tw.WarehouseName as to_warehouse_name
        FROM public."ProductMovement" m
        LEFT JOIN public."Product" p ON m.product_id = p.product_id
        LEFT JOIN public."Product_Movement_Type" mt ON m.movement_type_id = mt.movement_type_id
        LEFT JOIN public."Warehouse" fw ON m.from_warehouse_id = fw.WarehouseID
        LEFT JOIN public."Warehouse" tw ON m.to_warehouse_id = tw.WarehouseID
        WHERE m.product_id = $1 AND p.company_id = $2
        ORDER BY m.movement_date DESC
      `;

      db.query(query, [product_id, company_id], (err, result) => {
        if (err) {
          console.error("Errore nella query getMovementsByProduct:", err);
          reject(err);
          return;
        }
        resolve(result.rows);
      });
    });
  }

  // Recupera movimenti per magazzino
  static async getMovementsByWarehouse(db, warehouse_id, company_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          m.*,
          p.name as product_name,
          p.sku as product_sku,
          mt.movement_name,
          fw.WarehouseName as from_warehouse_name,
          tw.WarehouseName as to_warehouse_name
        FROM public."ProductMovement" m
        LEFT JOIN public."Product" p ON m.product_id = p.product_id
        LEFT JOIN public."Product_Movement_Type" mt ON m.movement_type_id = mt.movement_type_id
        LEFT JOIN public."Warehouse" fw ON m.from_warehouse_id = fw.WarehouseID
        LEFT JOIN public."Warehouse" tw ON m.to_warehouse_id = tw.WarehouseID
        WHERE (m.from_warehouse_id = $1 OR m.to_warehouse_id = $1) AND p.company_id = $2
        ORDER BY m.movement_date DESC
      `;

      db.query(query, [warehouse_id, company_id], (err, result) => {
        if (err) {
          console.error("Errore nella query getMovementsByWarehouse:", err);
          reject(err);
          return;
        }
        resolve(result.rows);
      });
    });
  }

  // Recupera movimenti per tipo
  static async getMovementsByType(db, movement_type_id, company_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          m.*,
          p.name as product_name,
          p.sku as product_sku,
          mt.movement_name,
          fw.WarehouseName as from_warehouse_name,
          tw.WarehouseName as to_warehouse_name
        FROM public."ProductMovement" m
        LEFT JOIN public."Product" p ON m.product_id = p.product_id
        LEFT JOIN public."Product_Movement_Type" mt ON m.movement_type_id = mt.movement_type_id
        LEFT JOIN public."Warehouse" fw ON m.from_warehouse_id = fw.WarehouseID
        LEFT JOIN public."Warehouse" tw ON m.to_warehouse_id = tw.WarehouseID
        WHERE m.movement_type_id = $1 AND p.company_id = $2
        ORDER BY m.movement_date DESC
      `;

      db.query(query, [movement_type_id, company_id], (err, result) => {
        if (err) {
          console.error("Errore nella query getMovementsByType:", err);
          reject(err);
          return;
        }
        resolve(result.rows);
      });
    });
  }

  // Recupera movimenti per intervallo di date
  static async getMovementsByDate(db, start_date, end_date, company_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          m.*,
          p.name as product_name,
          p.sku as product_sku,
          mt.movement_name,
          fw.WarehouseName as from_warehouse_name,
          tw.WarehouseName as to_warehouse_name
        FROM public."ProductMovement" m
        LEFT JOIN public."Product" p ON m.product_id = p.product_id
        LEFT JOIN public."Product_Movement_Type" mt ON m.movement_type_id = mt.movement_type_id
        LEFT JOIN public."Warehouse" fw ON m.from_warehouse_id = fw.WarehouseID
        LEFT JOIN public."Warehouse" tw ON m.to_warehouse_id = tw.WarehouseID
        WHERE m.movement_date BETWEEN $1 AND $2 AND p.company_id = $3
        ORDER BY m.movement_date DESC
      `;

      db.query(query, [start_date, end_date, company_id], (err, result) => {
        if (err) {
          console.error("Errore nella query getMovementsByDate:", err);
          reject(err);
          return;
        }
        resolve(result.rows);
      });
    });
  }

  // Aggiorna un movimento
  static async updateMovement(db, movement_id, data, company_id, updated_by) {
    return new Promise((resolve, reject) => {
      // Prima verifichiamo che il movimento esista e appartenga alla company
      const checkQuery = `
        SELECT m.movement_id FROM public."ProductMovement" m
        LEFT JOIN public."Product" p ON m.product_id = p.product_id
        WHERE m.movement_id = $1 AND p.company_id = $2
      `;

      db.query(checkQuery, [movement_id, company_id], (err, result) => {
        if (err) {
          console.error("Errore nella verifica del movimento:", err);
          reject(err);
          return;
        }

        if (!result.rows || result.rows.length === 0) {
          reject(
            new Error(
              "Movimento non trovato o non autorizzato all'aggiornamento"
            )
          );
          return;
        }

        // Costruiamo dinamicamente la query di aggiornamento
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        if (data.amount !== undefined) {
          updateFields.push(`amount = $${paramIndex++}`);
          updateValues.push(data.amount);
        }
        if (data.from_warehouse_id !== undefined) {
          updateFields.push(`from_warehouse_id = $${paramIndex++}`);
          updateValues.push(data.from_warehouse_id);
        }
        if (data.to_warehouse_id !== undefined) {
          updateFields.push(`to_warehouse_id = $${paramIndex++}`);
          updateValues.push(data.to_warehouse_id);
        }
        if (data.from_vehicle_id !== undefined) {
          updateFields.push(`from_vehicle_id = $${paramIndex++}`);
          updateValues.push(data.from_vehicle_id);
        }
        if (data.to_vehicle_id !== undefined) {
          updateFields.push(`to_vehicle_id = $${paramIndex++}`);
          updateValues.push(data.to_vehicle_id);
        }
        if (data.movement_date !== undefined) {
          updateFields.push(`movement_date = $${paramIndex++}`);
          updateValues.push(data.movement_date);
        }
        if (data.from_supplier !== undefined) {
          // Gestione corretta del campo from_supplier (deve essere bigint o null)
          let fromSupplier = null;
          if (data.from_supplier !== null) {
            const supplierNum = parseInt(data.from_supplier);
            if (!isNaN(supplierNum) && supplierNum > 0) {
              fromSupplier = supplierNum;
            }
          }
          updateFields.push(`from_supplier = $${paramIndex++}`);
          updateValues.push(fromSupplier);
        }

        // Aggiungiamo le condizioni WHERE
        updateValues.push(movement_id);

        if (updateFields.length === 0) {
          // Nessun campo da aggiornare
          resolve({
            movement_id: movement_id,
            message: "Nessun campo da aggiornare",
          });
          return;
        }

        const updateQuery = `
          UPDATE public."ProductMovement" 
          SET ${updateFields.join(", ")} 
          WHERE movement_id = $${paramIndex++}
          RETURNING movement_id
        `;

        db.query(updateQuery, updateValues, (err, updateResult) => {
          if (err) {
            console.error("Errore nell'aggiornamento del movimento:", err);
            reject(err);
            return;
          }

          resolve({
            movement_id: movement_id,
            message: "Movimento aggiornato con successo",
          });
        });
      });
    });
  }

  // Elimina un movimento
  static async deleteMovement(db, movement_id, company_id) {
    return new Promise(async (resolve, reject) => {
      try {
        // Prima verifichiamo che il movimento esista e appartenga alla company
        const checkQuery = `
          SELECT m.movement_id, m.movement_type_id, m.amount, m.product_id, 
                 m.from_warehouse_id, m.to_warehouse_id
          FROM public."ProductMovement" m
          LEFT JOIN public."Product" p ON m.product_id = p.product_id
          WHERE m.movement_id = $1 AND p.company_id = $2
        `;

        const result = await new Promise((res, rej) => {
          db.query(checkQuery, [movement_id, company_id], (err, result) => {
            if (err) {
              console.error("Errore nella verifica del movimento:", err);
              rej(err);
              return;
            }
            res(result);
          });
        });

        if (!result.rows || result.rows.length === 0) {
          reject(
            new Error(
              "Movimento non trovato o non autorizzato all'eliminazione"
            )
          );
          return;
        }

        const movement = result.rows[0];

        // Revertiamo l'effetto del movimento sullo stock prima di eliminarlo
        switch (movement.movement_type_id) {
          case 1: // Carico - rimuoviamo dal stock
            const revertLoadQuery = `
              UPDATE public."Product" 
              SET stock_unit = COALESCE(stock_unit, 0) - $1
              WHERE product_id = $2 AND COALESCE(stock_unit, 0) >= $1
            `;

            await new Promise((res, rej) => {
              db.query(
                revertLoadQuery,
                [movement.amount, movement.product_id],
                (err, revertResult) => {
                  if (err) {
                    console.error(
                      "Errore nel ripristino dello stock (carico):",
                      err
                    );
                    rej(err);
                    return;
                  }

                  if (revertResult.rowCount === 0) {
                    rej(
                      new Error(
                        "Impossibile eliminare il movimento: stock insufficiente"
                      )
                    );
                    return;
                  }

                  res();
                }
              );
            });
            break;

          case 2: // Scarico - aggiungiamo al stock
            const revertUnloadQuery = `
              UPDATE public."Product" 
              SET stock_unit = COALESCE(stock_unit, 0) + $1
              WHERE product_id = $2
            `;

            await new Promise((res, rej) => {
              db.query(
                revertUnloadQuery,
                [movement.amount, movement.product_id],
                (err, result) => {
                  if (err) {
                    console.error(
                      "Errore nel ripristino dello stock (scarico):",
                      err
                    );
                    rej(err);
                    return;
                  }
                  res();
                }
              );
            });
            break;

          case 3: // Trasferimento - ripristiniamo le quantità nei magazzini
            // Aggiungi al magazzino di origine
            if (movement.from_warehouse_id) {
              const addToOriginQuery = `
                UPDATE public."Product" 
                SET stock_unit = COALESCE(stock_unit, 0) + $1
                WHERE product_id = $2 AND warehouse_id = $3
              `;

              await new Promise((res, rej) => {
                db.query(
                  addToOriginQuery,
                  [
                    movement.amount,
                    movement.product_id,
                    movement.from_warehouse_id,
                  ],
                  (err, result) => {
                    if (err) {
                      rej(err);
                      return;
                    }
                    res();
                  }
                );
              });
            }

            // Sottrai dal magazzino di destinazione
            if (movement.to_warehouse_id) {
              const subtractFromDestQuery = `
                UPDATE public."Product" 
                SET stock_unit = COALESCE(stock_unit, 0) - $1
                WHERE product_id = $2 AND warehouse_id = $3 AND COALESCE(stock_unit, 0) >= $1
              `;

              await new Promise((res, rej) => {
                db.query(
                  subtractFromDestQuery,
                  [
                    movement.amount,
                    movement.product_id,
                    movement.to_warehouse_id,
                  ],
                  (err, result) => {
                    if (err) {
                      rej(err);
                      return;
                    }
                    res();
                  }
                );
              });
            }
            break;
        }

        // Elimina il movimento
        const deleteQuery = `DELETE FROM public."ProductMovement" WHERE movement_id = $1 RETURNING movement_id`;

        await new Promise((res, rej) => {
          db.query(deleteQuery, [movement_id], (err, deleteResult) => {
            if (err) {
              console.error("Errore nell'eliminazione del movimento:", err);
              rej(err);
              return;
            }
            res();
          });
        });

        resolve({
          movement_id: movement_id,
          message: "Movimento eliminato con successo",
        });
      } catch (error) {
        console.error("Errore nell'eliminazione del movimento:", error);
        reject(error);
      }
    });
  }

  // Crea un movimento di carico su furgone
  static async createLoadToVehicleMovement(db, data, company_id, created_by) {
    return new Promise((resolve, reject) => {
      // Verifica che il prodotto appartenga alla company
      const productQuery = `SELECT product_id FROM public."Product" WHERE product_id = $1 AND company_id = $2`;
      db.query(
        productQuery,
        [data.product_id, company_id],
        (err, productResult) => {
          if (err) return reject(err);
          if (!productResult.rows || productResult.rows.length === 0)
            return reject(new Error("Prodotto non trovato o non autorizzato"));

          // Inserisci il movimento
          const insertQuery = `
          INSERT INTO public."ProductMovement"
          (product_id, from_warehouse_id, to_vehicle_id, amount, movement_type_id, movement_date, created_by)
          VALUES ($1, $2, $3, $4, 1, $5, $6)
          RETURNING movement_id
        `;
          const values = [
            data.product_id,
            data.from_warehouse_id,
            data.to_vehicle_id,
            data.amount,
            data.movement_date || new Date(),
            created_by,
          ];
          db.query(insertQuery, values, async (err, result) => {
            if (err) return reject(err);
            if (!result.rows || result.rows.length === 0)
              return reject(new Error("Errore nell'inserimento del movimento"));

            // Sottrai la quantità dal magazzino di origine
            const subtractQuery = `
              UPDATE public."Product"
              SET stock_unit = COALESCE(stock_unit, 0) - $1
              WHERE product_id = $2 AND warehouse_id = $3 AND COALESCE(stock_unit, 0) >= $1
            `;
            db.query(
              subtractQuery,
              [data.amount, data.product_id, data.from_warehouse_id],
              (err, result2) => {
                if (err) return reject(err);
                if (result2.rowCount === 0) {
                  return reject(
                    new Error("Stock insufficiente nel magazzino di origine")
                  );
                }
                resolve({
                  movement_id: result.rows[0].movement_id,
                  message:
                    "Movimento di carico su furgone creato con successo e stock aggiornato",
                });
              }
            );
          });
        }
      );
    });
  }
}

module.exports = MovementModel;
