/**
 * Form API Routes
 * server/src/routes/formRoutes.js
 *
 * CRUD + Search/Filter + POST /process for OCR/AI extraction
 */

import express from "express";
import multer from "multer";
import { Form } from "../models/Form.js";
import {
  extractTextFromFile,
  extractKeyValuePairs,
  KNOWN_FIELD_IDS,
} from "../utils/ocrProcessor.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

/**
 * GET /api/forms - List all forms with optional search & date filter
 * Query: search (text), dateFrom (ISO), dateTo (ISO)
 * Search is dynamic: matches formName and any field inside answers (no hardcoded keys).
 */
router.get("/", async (req, res) => {
  try {
    const { search, dateFrom, dateTo } = req.query;
    const filter = {};

    // Date range filter - submittedAt
    if (dateFrom || dateTo) {
      filter.submittedAt = {};
      if (dateFrom) filter.submittedAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        filter.submittedAt.$lte = end;
      }
    }

    const searchTerm = search && search.trim();
    let list;

    if (searchTerm) {
      // Dynamic search: formName + all keys inside answers (any field)
      const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pipeline = [
        ...(Object.keys(filter).length ? [{ $match: filter }] : []),
        {
          $addFields: {
            _searchable: {
              $reduce: {
                input: { $objectToArray: { $ifNull: ["$answers", {}] } },
                initialValue: { $concat: [" ", { $ifNull: ["$formName", ""] }] },
                in: {
                  $concat: [
                    "$$value",
                    " ",
                    {
                      $cond: [
                        { $eq: [{ $type: "$$this.v" }, "string"] },
                        "$$this.v",
                        { $toString: "$$this.v" },
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
        { $match: { _searchable: { $regex: escaped, $options: "i" } } },
        { $project: { _searchable: 0 } },
        { $sort: { submittedAt: -1 } },
      ];
      list = await Form.aggregate(pipeline);
    } else {
      list = await Form.find(filter).sort({ submittedAt: -1 }).lean();
    }

    res.json(list);
  } catch (err) {
    console.error("GET /api/forms error:", err);
    res.status(500).json({ error: "Failed to fetch forms" });
  }
});

/**
 * POST /api/forms - Save new form (draft or finalized)
 * Body: { formName, status, language, answers, autoFilledFields, submittedAt? }
 */
router.post("/", async (req, res) => {
  try {
    const { formName, status, language, answers, autoFilledFields, submittedAt } = req.body;
    const doc = await Form.create({
      formName: formName || "Registration Form",
      status: status || "draft",
      language: language || "en",
      answers: answers || {},
      autoFilledFields: autoFilledFields || [],
      ...(submittedAt && { submittedAt: new Date(submittedAt) }),
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error("POST /api/forms error:", err);
    res.status(500).json({ error: "Failed to save form" });
  }
});

/**
 * POST /api/forms/process - AI/OCR: accept form + documents (PDF/images), extract key-value pairs, return answers + autoFilledFields
 * Multipart: "form" (1 file), "documents" (0+ files)
 */
router.post(
  "/process",
  upload.fields([{ name: "form", maxCount: 1 }, { name: "documents", maxCount: 20 }]),
  async (req, res) => {
    try {
      const files = [];
      if (req.files?.form?.[0]) files.push(req.files.form[0]);
      if (req.files?.documents) files.push(...req.files.documents);

      let allText = "";
      for (const file of files) {
        const text = await extractTextFromFile(
          file.buffer,
          file.mimetype,
          file.originalname
        );
        allText += "\n" + text;
      }

      // Merge: existing answers take priority, OCR fills only gaps
      const existingAnswers = (req.body && req.body.existingAnswers)
        ? req.body.existingAnswers
        : {};
      const ocrAnswers = extractKeyValuePairs(allText);
      const answers = { ...ocrAnswers, ...existingAnswers }; // existing wins
      const autoFilledFields = Object.keys(ocrAnswers).filter((k) =>
        KNOWN_FIELD_IDS.includes(k)
      );
      if (autoFilledFields.length === 0 && Object.keys(ocrAnswers).length > 0) {
        autoFilledFields.push(...Object.keys(ocrAnswers));
      }

      res.json({ answers, autoFilledFields });
    } catch (err) {
      console.error("POST /api/forms/process error:", err);
      res.status(500).json({ error: "Failed to process documents", details: err.message });
    }
  }
);

/**
 * GET /api/forms/:id - Get single form by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const doc = await Form.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: "Form not found" });
    res.json(doc);
  } catch (err) {
    console.error("GET /api/forms/:id error:", err);
    res.status(500).json({ error: "Failed to fetch form" });
  }
});

/**
 * PUT /api/forms/:id - Update form (e.g., finalize draft)
 */
router.put("/:id", async (req, res) => {
  try {
    const { formName, status, language, answers, autoFilledFields, submittedAt } = req.body;
    const doc = await Form.findByIdAndUpdate(
      req.params.id,
      {
        ...(formName && { formName }),
        ...(status && { status }),
        ...(language && { language }),
        ...(answers && { answers }),
        ...(autoFilledFields && { autoFilledFields }),
        ...(submittedAt && { submittedAt: new Date(submittedAt) }),
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: "Form not found" });
    res.json(doc);
  } catch (err) {
    console.error("PUT /api/forms/:id error:", err);
    res.status(500).json({ error: "Failed to update form" });
  }
});

/**
 * DELETE /api/forms/:id - Delete form
 */
router.delete("/:id", async (req, res) => {
  try {
    const result = await Form.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Form not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/forms error:", err);
    res.status(500).json({ error: "Failed to delete form" });
  }
});

export default router;
