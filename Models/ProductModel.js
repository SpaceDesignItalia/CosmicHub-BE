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

  static async createNewProduct(db, name, category, attributes) {
    console.log(name, category, attributes);
    return new Promise((resolve, reject) => {
      const categoryQuery = `SELECT category_id FROM public."Category" WHERE name = '${category}'`;
      console.log(categoryQuery);
      db.query(categoryQuery, (err, result) => {
        if (err) reject(err);
        console.log(result);
        const category_id = result.rows[0].category_id;
        const productQuery = `INSERT INTO public."Product" (name, company_id, category_id) VALUES ($1, 1, $2)`;
        db.query(productQuery, [name, category_id], (err, result) => {
          if (err) reject(err);
          attributes.forEach((attribute) => {
            const attributesQuery = `INSERT INTO public."Attribute" (name, value, data_type) VALUES ($1, $2, $3)`;
            db.query(
              attributesQuery,
              [attribute.name, attribute.value, attribute.type],
              (err, result) => {
                if (err) reject(err);
                resolve(result);
              }
            );
          });
        });
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
