// DocumentController.js
const Document = require("../Models/DocumentModel");

class DocumentController {
  // Recupera tutti i documenti
  static async getAllDDT(req, res, db) {
    try {
      const company_id = req.session.account.company_id;
      const ddt = await Document.getAllDDT(db, company_id);
      res.status(200).json(ddt);
    } catch (error) {
      console.error("Errore nel recupero dei documenti:", error);
      res.status(500).json({ error: "Errore nel recupero dei documenti" });
    }
  }

  // Crea un DDT
  static async createDDT(req, res, db) {
    try {
      const company_id = req.session.account.company_id;
      const ddt = req.body;
      const ddt_id = await Document.createDDT(db, company_id, ddt);
      res.status(200).json(ddt_id);
    } catch (error) {
      console.error("Errore nella creazione del DDT:", error);
      res.status(500).json({ error: "Errore nella creazione del DDT" });
    }
  }

  // Aggiorna lo stato di un DDT
  static async updateDDTStatus(req, res, db) {
    try {
      const ddt_id = req.body.DDT_id;
      const status = req.body.status;
      const ddt = await Document.updateDDTStatus(db, ddt_id, status);
      res.status(200).json(ddt);
    } catch (error) {
      console.error("Errore nell'aggiornamento dello stato del DDT:", error);
      res
        .status(500)
        .json({ error: "Errore nell'aggiornamento dello stato del DDT" });
    }
  }

  // Crea un documento veicolo
  static async createVehicleDocument(req, res, db) {
    try {
      const company_id = req.session.account.company_id;

      const formData = req.body;
      const uploadedFile = req.file;

      console.log("Dati del form:", formData);
      console.log(
        "File caricato:",
        uploadedFile
          ? {
              originalname: uploadedFile.originalname,
              mimetype: uploadedFile.mimetype,
              size: uploadedFile.size,
              path: uploadedFile.path,
            }
          : "Nessun file"
      );

      let parsedData = {};
      if (formData.data) {
        try {
          parsedData = JSON.parse(formData.data);
          console.log("Dati parsati:", parsedData);
        } catch (parseError) {
          console.error("Errore nel parsing dei dati JSON:", parseError);
        }
      }

      // Estrai il path relativo del file salvato
      const filePath = uploadedFile ? uploadedFile.filename : null;
      console.log("Path relativo del file salvato:", filePath);

      const document = await Document.createVehicleDocument(
        db,
        company_id,
        parsedData,
        filePath
      );
      res.status(200).json(document);
    } catch (error) {
      console.error("Errore nella creazione del documento veicolo:", error);
      res
        .status(500)
        .json({ error: "Errore nella creazione del documento veicolo" });
    }
  }

  // Recupera tutti i documenti veicolo
  static async getAllVehicleDocuments(req, res, db) {
    try {
      const company_id = req.session.account.company_id;
      const vehicle_documents = await Document.getAllVehicleDocuments(
        db,
        company_id
      );
      res.status(200).json(vehicle_documents);
    } catch (error) {
      console.error("Errore nel recupero dei documenti veicolo:", error);
      res
        .status(500)
        .json({ error: "Errore nel recupero dei documenti veicolo" });
    }
  }

  // Download di un documento
  static async downloadDocument(req, res, db) {
    try {
      const document_id = req.params.document_id;
      const company_id = req.session.account.company_id;

      console.log(document_id, company_id);

      // Recupera le informazioni del documento
      const document = await Document.getVehicleDocumentPathById(
        db,
        document_id,
        company_id
      );

      if (!document) {
        return res.status(404).json({ error: "Documento non trovato" });
      }

      // Costruisci il path completo del file
      const path = require("path");
      const documentsDir = path.join(__dirname, "../documents");
      const filePath = path.join(documentsDir, document.file_path);

      // Verifica che il file esista
      const fs = require("fs");
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File non trovato" });
      }

      // Determina il tipo MIME basato sull'estensione
      const ext = path.extname(filePath).toLowerCase();
      let mimeType = "application/octet-stream";

      switch (ext) {
        case ".pdf":
          mimeType = "application/pdf";
          break;
        case ".jpg":
        case ".jpeg":
          mimeType = "image/jpeg";
          break;
        case ".png":
          mimeType = "image/png";
          break;
        case ".doc":
          mimeType = "application/msword";
          break;
        case ".docx":
          mimeType =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          break;
        case ".xls":
          mimeType = "application/vnd.ms-excel";
          break;
        case ".xlsx":
          mimeType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          break;
      }

      // Imposta gli header per il download
      res.setHeader("Content-Type", mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${document.document_name || document.file_path}"`
      );

      // Invia il file
      console.log(filePath);
      res.sendFile(filePath);
    } catch (error) {
      console.error("Errore nel download del documento:", error);
      res.status(500).json({ error: "Errore nel download del documento" });
    }
  }
}

module.exports = DocumentController;
