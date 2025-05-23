// productController.js
const Product = require("../Models/ProductModel");

class ProductController {
  static async getAllCategories(res, db) {
    try {
      const categories = await Product.getAllCategories(db);
      res.status(200).json(categories);
    } catch (error) {
      console.error("Errore nel recupero delle categorie:", error);
      res.status(500).send("Errore nel recupero delle categorie");
    }
  }

  static async createNewProduct(req, res, db) {
    try {
      const data = req.body;
      const company_id = req.session.account.company_id;
      const created_by = req.session.account.user_id;
      console.log(data, company_id, created_by);
      const product = await Product.createNewProduct(
        db,
        data,
        company_id,
        created_by
      );
      res.status(200).json(product);
    } catch (error) {
      console.error("Errore nella creazione del prodotto:", error);
      res.status(500).send("Errore nella creazione del prodotto");
    }
  }

  static async createNewCategory(req, res, db) {
    try {
      const name = req.body.name;
      const attributes = req.body.attributes;
      const company_id = req.session.account.company_id;
      const created_by = req.session.account.user_id;
      const category = await Product.createNewCategory(
        db,
        name,
        attributes,
        company_id,
        created_by
      );
      res.status(200).json(category);
    } catch (error) {
      console.error("Errore nella creazione della categoria:", error);
      res.status(500).send("Errore nella creazione della categoria");
    }
  }
}

module.exports = ProductController;
