/**
 * Form API Routes
 * server/src/routes/formRoutes.js
 *
 * CRUD + Search/Filter - History page ke liye optimized MongoDB queries ($regex)
 */

import express from "express";
import { Form } from "../models/Form.js";

const router = express.Router();

/**
 * GET /api/forms - List all forms with optional search & date filter
 * Query: search (text), dateFrom (ISO), dateTo (ISO)
 * MongoDB $regex se fast search - 100+ fields bhi handle ho jayenge
 */
router.get("/", async (req, res) => {
  try {
    const { search, dateFrom, dateTo } = req.query;
    const filter = {};

    // Date range filter - submittedAt ke hisaab se
    if (dateFrom || dateTo) {
      filter.submittedAt = {};
      if (dateFrom) filter.submittedAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        filter.submittedAt.$lte = end;
      }
    }

    // Search - MongoDB $regex (case-insensitive) on formName + common answer keys
    // Future fields bhi search ke liye: answers Mixed hai, toh known keys + formName se fast results
    const finalFilter = { ...filter };
    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = { $regex: escaped, $options: "i" };
      finalFilter.$or = [
        { formName: regex },
        { "answers.fullName": regex },
        { "answers.dateOfBirth": regex },
        { "answers.email": regex },
        { "answers.phoneNumber": regex },
        { "answers.aadhaar": regex },
        { "answers.address": regex },
        { "answers.city": regex },
        { "answers.state": regex },
        { "answers.pincode": regex },
        { "answers.fatherName": regex },
        { "answers.motherName": regex },
        { "answers.occupation": regex },
      ];
    }

    const list = await Form.find(finalFilter).sort({ submittedAt: -1 }).lean();
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
