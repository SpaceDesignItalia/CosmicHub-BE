// productModel.js

class ProductModel {
  static async getAllCategories(db) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT "Category_Attribute"."name", "Category_Attribute"."type", "Category"."name" AS "category_name", "Category_Attribute"."attribute_id", "Category"."category_id", "Category_Attribute"."isRequired" FROM public."Category_Attribute"
        RIGHT JOIN public."Category" USING(category_id)`,
        (err, result) => {
          if (err) reject(err);
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
        if (err) reject(err);
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
            if (err) reject(err);
            const product_id = result.rows[0].product_id;
            const attributesQuery = `INSERT INTO public."Attribute" (name, data_type, value, is_required, created_by, product_id) VALUES ($1, $2, $3, $4, $5, $6)`;
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
                  resolve(result);
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
        if (err) reject(err);
        console.log(result);
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
              resolve(result);
            }
          );
        });
      });
    });
  }
}

module.exports = ProductModel;
