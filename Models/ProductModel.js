// productModel.js

class ProductModel {
  static async getAllCategories(db) {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM Category", (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
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
}

module.exports = ProductModel;
