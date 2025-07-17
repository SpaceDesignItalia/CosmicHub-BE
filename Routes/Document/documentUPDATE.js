// documentUPDATE.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const DocumentController = require("../../Controllers/DocumentController");
const authenticateMiddleware = require("../../middlewares/Authentication/Authmiddleware");

// Crea la cartella documents se non esiste (fuori da public)
const documentsDir = path.join(__dirname, "../../documents");
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

// Configura multer per salvare i file nella cartella documents
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, documentsDir);
  },
  filename: function (req, file, cb) {
    // Genera un nome file unico con timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite di 10MB
  },
});

const documentUPDATE = (db) => {
  router.put("/UpdateDDTStatus", authenticateMiddleware, (req, res) => {
    DocumentController.updateDDTStatus(req, res, db);
  });

  router.put(
    "/UpdateVehicleDocument",
    upload.single("file"),
    authenticateMiddleware,
    (req, res) => {
      DocumentController.updateVehicleDocument(req, res, db);
    }
  );

  router.put(
    "/UpdateCompanyDocument",
    upload.single("file"),
    authenticateMiddleware,
    (req, res) => {
      DocumentController.updateCompanyDocument(req, res, db);
    }
  );

  return router;
};

module.exports = documentUPDATE;
