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
      const name = req.body.name;
      const category = req.body.category;
      const attributes = req.body.attributes;
      const product = await Product.createNewProduct(
        db,
        name,
        category,
        attributes
      );
      res.status(200).json(product);
    } catch (error) {
      console.error("Errore nella creazione del prodotto:", error);
      res.status(500).send("Errore nella creazione del prodotto");
    }
  }
}

module.exports = ProductController;
