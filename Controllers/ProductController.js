// productController.js
const Product = require("../Models/ProductModel");

class ProductController {
  static async getAllCategories(req, res, db) {
    try {
      const categories = await Product.getAllCategories(db);
      res.status(200).json(categories);
    } catch (error) {
      console.error("Errore nel recupero delle categorie:", error);
      res.status(500).send("Errore nel recupero delle categorie");
    }
  }

  static async getProductsByWarehouse(req, res, db) {
    try {
      const warehouse_id = req.query.warehouse_id;

      if (!warehouse_id) {
        return res.status(400).json({ error: "warehouse_id è richiesto" });
      }

      const products = await Product.getProductsByWarehouse(db, warehouse_id);
      res.status(200).json(products);
    } catch (error) {
      console.error("Errore nel recupero dei prodotti:", error);
      res.status(500).send("Errore nel recupero dei prodotti");
    }
  }

  static async getProductById(req, res, db) {
    try {
      const product_id = req.params.id;
      const company_id = req.session.account.company_id;

      if (!product_id) {
        return res.status(400).json({ error: "ID prodotto è richiesto" });
      }

      const product = await Product.getProductById(db, product_id, company_id);
      res.status(200).json(product);
    } catch (error) {
      console.error("Errore nel recupero del prodotto:", error);
      if (error.message === "Prodotto non trovato o non autorizzato") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Errore nel recupero del prodotto" });
      }
    }
  }

  static async createNewProduct(req, res, db) {
    try {
      const data = req.body;
      const company_id = req.session.account.company_id;
      const created_by = req.session.account.user_id;
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

  static async getAllProducts(req, res, db) {
    try {
      const products = await Product.getAllProducts(db);
      res.status(200).json(products);
    } catch (error) {
      console.error("Errore nel recupero dei prodotti:", error);
      res.status(500).send("Errore nel recupero dei prodotti");
    }
  }

  static async updateProduct(req, res, db) {
    try {
      const product_id = req.params.id;
      const data = req.body;
      const company_id = req.session.account.company_id;
      const updated_by = req.session.account.user_id;

      if (!product_id) {
        return res.status(400).json({ error: "ID prodotto è richiesto" });
      }

      const product = await Product.updateProduct(
        db,
        product_id,
        data,
        company_id,
        updated_by
      );
      res.status(200).json(product);
    } catch (error) {
      console.error("Errore nell'aggiornamento del prodotto:", error);
      if (
        error.message ===
        "Prodotto non trovato o non autorizzato all'aggiornamento"
      ) {
        res.status(404).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: "Errore nell'aggiornamento del prodotto" });
      }
    }
  }

  static async updateProductQuantity(req, res, db) {
    try {
      const product_id = req.body.product_id;
      const quantity = req.body.stock_unit;
      const product = await Product.updateProductQuantity(
        db,
        product_id,
        quantity
      );
      res.status(200).json(true);
    } catch (error) {
      console.error(
        "Errore nell'aggiornamento della quantità del prodotto:",
        error
      );
      res
        .status(500)
        .send("Errore nell'aggiornamento della quantità del prodotto");
    }
  }

  static async getAllProductMovements(req, res, db) {
    try {
      const movements = await Product.getAllProductMovements(db);

      if (movements.length === 0) {
        return res.status(404).json({ error: "Nessun movimento trovato" });
      }

      res.status(200).json(movements);
    } catch (error) {
      console.error("Errore nel recupero dei movimenti del prodotto:", error);
      res.status(500).send("Errore nel recupero dei movimenti del prodotto");
    }
  }

  static async deleteProduct(req, res, db) {
    try {
      const product_id = req.params.id;
      const company_id = req.session.account.company_id;

      if (!product_id) {
        return res.status(400).json({ error: "ID prodotto è richiesto" });
      }

      const result = await Product.deleteProduct(db, product_id, company_id);
      res.status(200).json(result);
    } catch (error) {
      console.error("Errore nell'eliminazione del prodotto:", error);
      if (
        error.message ===
        "Prodotto non trovato o non autorizzato all'eliminazione"
      ) {
        res.status(404).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: "Errore nell'eliminazione del prodotto" });
      }
    }
  }
}

module.exports = ProductController;
