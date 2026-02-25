/**
 * Form Model - Flexible Schema (No-Crash)
 * server/src/models/Form.js
 *
 * strict: false = Future mein aap 50+ naye fields add karenge toh bhi DB accept karega,
 * Schema Mismatch error nahi aayega.
 * All extra keys are stored as-is in MongoDB.
 */

import mongoose from "mongoose";

const formSchema = new mongoose.Schema(
  {
    // Basic metadata - yeh minimal required fields hain
    formName: { type: String, default: "Registration Form" },
    status: { type: String, enum: ["draft", "finalized"], default: "draft" },
    language: { type: String, default: "en" },
    submittedAt: { type: Date, default: Date.now },
    // Dynamic form data - kitne bhi fields ho sakte hain (18 se 100+)
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
    autoFilledFields: { type: [String], default: [] },
  },
  {
    strict: false, // Allow any extra fields - future fields auto-save
    timestamps: true,
  }
);

export const Form = mongoose.model("Form", formSchema);
