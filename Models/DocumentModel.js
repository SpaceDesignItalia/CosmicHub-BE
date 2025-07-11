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
}

module.exports = DocumentModel;
