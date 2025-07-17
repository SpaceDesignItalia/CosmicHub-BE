// DocumentModel.js
class DocumentModel {
  // Recupera tutti i documenti
  static async getAllDDT(db, company_id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM public."Document" 
      INNER JOIN public."Document_Type" ON public."Document".type = public."Document_Type".document_type_id
      INNER JOIN public."DDT_Document" ON public."Document".document_id = public."DDT_Document".document_id
      INNER JOIN public."Vehicle" ON public."DDT_Document".vehicle_id = public."Vehicle".vehicle_id
      WHERE public."Document".company_id = $1 AND public."Document_Type".document_type_id = 1`;
      db.query(query, [company_id], (err, result) => {
        if (err) return reject(err);
        const productQuery = `SELECT * FROM public."DDT_Product" 
        INNER JOIN public."Product" ON public."DDT_Product".product_id = public."Product".product_id 
        WHERE public."DDT_Product"."DDT_id" = $1`;
        const productPromises = result.rows.map((row) => {
          return new Promise((resolve, reject) => {
            db.query(productQuery, [row.DDT_id], (err, result) => {
              if (err) return reject(err);
              row.items = result.rows;
              resolve(row);
            });
          });
        });
        Promise.all(productPromises)
          .then((rows) => {
            resolve(rows);
          })
          .catch((err) => {
            reject(err);
          });
      });
    });
  }

  // Crea un DDT
  static async createDDT(db, company_id, ddt) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO public."Document" (type, company_id) VALUES (1, $1) RETURNING document_id`;
      db.query(query, [company_id], (err, result) => {
        if (err) return reject(err);
        const document_id = result.rows[0].document_id;
        const query2 = `INSERT INTO public."DDT_Document" (document_id, date, departure_address, destination_address, status, vehicle_id, driver_name, driver_phone, customer_vat, customer_name, customer_phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;
        db.query(
          query2,
          [
            document_id,
            ddt.date,
            ddt.departure_address,
            ddt.destination_address,
            ddt.status,
            ddt.vehicle_id,
            ddt.driver_name,
            ddt.driver_phone,
            ddt.customer_vat,
            ddt.customer_name,
            ddt.customer_phone,
          ],
          (err, result) => {
            if (err) return reject(err);
            const ddt_id = result.rows[0].DDT_id;
            const query3 = `INSERT INTO public."DDT_Product" ("DDT_id", product_id, quantity) VALUES ($1, $2, $3)`;

            // Creiamo un array di Promise per tutte le query dei prodotti
            const productPromises = ddt.items.map((product) => {
              return new Promise((resolveProduct, rejectProduct) => {
                db.query(
                  query3,
                  [ddt_id, product.product_id, product.quantity],
                  (err, result) => {
                    if (err) return rejectProduct(err);
                    resolveProduct(result);
                  }
                );
              });
            });

            // Aspettiamo che tutte le query dei prodotti siano completate
            Promise.all(productPromises)
              .then(() => {
                resolve(ddt_id);
              })
              .catch((err) => {
                reject(err);
              });
          }
        );
      });
    });
  }

  // Aggiorna lo stato di un DDT
  static async updateDDTStatus(db, ddt_id, status) {
    console.log(ddt_id, status);
    return new Promise((resolve, reject) => {
      const query = `UPDATE public."DDT_Document" SET status = $1 WHERE "DDT_id" = $2`;
      db.query(query, [status, ddt_id], (err, result) => {
        if (err) return reject(err);
        resolve(result.rows[0]);
      });
    });
  }

  // Crea un documento veicolo
  static async createVehicleDocument(db, company_id, parsedData, filePath) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO public."Document" (type, company_id) VALUES (2, $1) RETURNING document_id`;
      db.query(query, [company_id], (err, result) => {
        if (err) return reject(err);
        const document_id = result.rows[0].document_id;
        const query2 = `INSERT INTO public."Vehicle_Document" (document_id, vehicle_id, title, note, type, emission_date, expiration_date, supplier, number, price, path) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;
        db.query(
          query2,
          [
            document_id,
            parsedData.entity_id,
            parsedData.title,
            parsedData.notes,
            parsedData.document_type,
            parsedData.issue_date,
            parsedData.expiry_date,
            parsedData.provider,
            parsedData.certificate_number,
            parsedData.cost,
            filePath,
          ],
          (err, result) => {
            if (err) return reject(err);
            resolve(result.rows[0]);
          }
        );
      });
    });
  }

  // Recupera tutti i documenti veicolo
  static async getAllVehicleDocuments(db, company_id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT 
        d.document_id,
        vd.title as title,
        vd.type as document_type,
        vd.path as file_path,
        vd.emission_date as issue_date,
        vd.expiration_date as expiry_date,
        d.company_id,
        vd.vehicle_id,
        v.license_plate as vehicle_license_plate,
        v.name as vehicle_name,
        vd.price as cost,
        vd.supplier as provider,
        vd.number as certificate_number,
        false as renewal_automatic,
        vd.status as status,
        vd.path as file_path,
        vd.note as notes
      FROM public."Vehicle_Document" vd
      INNER JOIN public."Document" d ON vd.document_id = d.document_id
      INNER JOIN public."Vehicle" v ON vd.vehicle_id = v.vehicle_id
      WHERE d.company_id = $1`;
      db.query(query, [company_id], (err, result) => {
        if (err) return reject(err);
        resolve(result.rows);
      });
    });
  }

  // Recupera un documento veicolo per ID
  static async getVehicleDocumentPathById(db, document_id, company_id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT 
        vd.path as file_path,
        vd.title as document_name,
        vd.type as document_type
      FROM public."Vehicle_Document" vd
      INNER JOIN public."Document" d ON vd.document_id = d.document_id
      WHERE d.document_id = $1 AND d.company_id = $2`;
      db.query(query, [document_id, company_id], (err, result) => {
        if (err) return reject(err);
        resolve(result.rows[0]);
      });
    });
  }

  // Aggiorna un documento veicolo
  static async updateVehicleDocument(db, company_id, updateData, newFilePath) {
    return new Promise((resolve, reject) => {
      // Prima recupera il documento esistente per ottenere il path del file precedente
      const getDocumentQuery = `SELECT vd.path as file_path, vd.document_id
        FROM public."Vehicle_Document" vd
        INNER JOIN public."Document" d ON vd.document_id = d.document_id
        WHERE d.document_id = $1 AND d.company_id = $2`;

      db.query(
        getDocumentQuery,
        [updateData.document_id, company_id],
        (err, result) => {
          if (err) return reject(err);

          if (result.rows.length === 0) {
            return reject(new Error("Documento non trovato"));
          }

          const existingDocument = result.rows[0];
          const oldFilePath = existingDocument.file_path;

          // Elimina il file precedente se esiste e se c'è un nuovo file o se il file è stato rimosso
          if (oldFilePath && (newFilePath || updateData.fileChanged)) {
            const fs = require("fs");
            const path = require("path");
            const documentsDir = path.join(__dirname, "../documents");
            const fullOldPath = path.join(documentsDir, oldFilePath);

            if (fs.existsSync(fullOldPath)) {
              try {
                fs.unlinkSync(fullOldPath);
                console.log("File precedente eliminato:", fullOldPath);
              } catch (unlinkError) {
                console.error(
                  "Errore nell'eliminazione del file precedente:",
                  unlinkError
                );
                // Non bloccare l'aggiornamento se l'eliminazione del file fallisce
              }
            }
          }

          // Determina il path finale del file
          const finalFilePath =
            newFilePath || (updateData.fileChanged ? null : oldFilePath);

          // Aggiorna il documento nel database
          const updateQuery = `UPDATE public."Vehicle_Document" 
          SET vehicle_id = $1, title = $2, note = $3, type = $4, emission_date = $5, 
              expiration_date = $6, supplier = $7, number = $8, price = $9, path = $10
          WHERE document_id = $11 AND document_id IN (
            SELECT d.document_id FROM public."Document" d WHERE d.company_id = $12
          ) RETURNING *`;

          db.query(
            updateQuery,
            [
              updateData.vehicle_id,
              updateData.title,
              updateData.notes,
              updateData.document_type,
              updateData.issue_date,
              updateData.expiry_date,
              updateData.provider,
              updateData.certificate_number,
              updateData.cost,
              finalFilePath,
              updateData.document_id,
              company_id,
            ],
            (err, result) => {
              if (err) return reject(err);

              if (result.rows.length === 0) {
                return reject(new Error("Documento non aggiornato"));
              }

              resolve(result.rows[0]);
            }
          );
        }
      );
    });
  }

  // Elimina un documento veicolo
  static async deleteVehicleDocument(db, document_id, company_id) {
    return new Promise((resolve, reject) => {
      // Prima recupera il documento per ottenere il path del file
      const getDocumentQuery = `SELECT vd.path as file_path, vd.document_id
        FROM public."Vehicle_Document" vd
        INNER JOIN public."Document" d ON vd.document_id = d.document_id
        WHERE d.document_id = $1 AND d.company_id = $2`;

      db.query(getDocumentQuery, [document_id, company_id], (err, result) => {
        if (err) return reject(err);

        if (result.rows.length === 0) {
          return reject(new Error("Documento non trovato"));
        }

        const document = result.rows[0];
        const filePath = document.file_path;

        // Elimina il file dal filesystem se esiste
        if (filePath) {
          const fs = require("fs");
          const path = require("path");
          const documentsDir = path.join(__dirname, "../documents");
          const fullPath = path.join(documentsDir, filePath);

          if (fs.existsSync(fullPath)) {
            try {
              fs.unlinkSync(fullPath);
              console.log("File eliminato:", fullPath);
            } catch (unlinkError) {
              console.error("Errore nell'eliminazione del file:", unlinkError);
              // Non bloccare l'eliminazione se la rimozione del file fallisce
            }
          }
        }

        // Elimina il record dal database
        const deleteQuery = `DELETE FROM public."Vehicle_Document" 
          WHERE document_id = $1 AND document_id IN (
            SELECT d.document_id FROM public."Document" d WHERE d.company_id = $2
          ) RETURNING *`;

        db.query(deleteQuery, [document_id, company_id], (err, result) => {
          if (err) return reject(err);

          if (result.rows.length === 0) {
            return reject(new Error("Documento non eliminato"));
          }

          // Elimina anche il record dalla tabella Document
          const deleteDocumentQuery = `DELETE FROM public."Document" 
            WHERE document_id = $1 AND company_id = $2 RETURNING *`;

          db.query(
            deleteDocumentQuery,
            [document_id, company_id],
            (err, docResult) => {
              if (err) return reject(err);

              resolve({
                message: "Documento eliminato con successo",
                deletedDocument: result.rows[0],
              });
            }
          );
        });
      });
    });
  }
}

module.exports = DocumentModel;
