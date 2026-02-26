/**
 * Form History - List, Search, Filter, View/Edit/Download/Print
 * client/src/app/pages/FormHistory.tsx
 *
 * API se list aati hai (MongoDB $regex search + date filter).
 * Server offline ho toh localStorage se fallback + error message.
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Eye,
  Edit,
  Download,
  Printer,
  Calendar,
  Globe,
  CheckCircle2,
  Clock,
  Trash2,
  Search,
  AlertCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { generateAndDownloadPDF, previewPDF } from "../utils/pdfGenerator";
import { apiUrl, apiHeaders } from "../../config/apiConfig";

/** Submission type - API (MongoDB) ya localStorage dono ke liye */
interface FormSubmission {
  id: string;
  _id?: string;
  formName: string;
  dateFilled: string;
  submittedAt?: string;
  status: "draft" | "finalized";
  language: string;
  answers: Record<string, any>;
  autoFilledFields: string[];
}

export function FormHistory() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiOffline, setApiOffline] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  /** Fetch list from API with search & date filter - try-catch for Server Offline / Network Error */
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setApiOffline(false);
    try {
      const params = new URLSearchParams();
      if (searchText.trim()) params.set("search", searchText.trim());
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const url = apiUrl("/api/forms") + (params.toString() ? "?" + params.toString() : "");
      const res = await fetch(url, { headers: apiHeaders });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      const list: FormSubmission[] = (data || []).map((d: any) => ({
        id: d._id || d.id || d.submittedAt || new Date().toISOString(),
        _id: d._id,
        formName: d.formName || "Registration Form",
        dateFilled: d.submittedAt || d.dateFilled || d.createdAt,
        status: d.status || "draft",
        language: d.language || "en",
        answers: d.answers || {},
        autoFilledFields: d.autoFilledFields || [],
      }));
      // Client-side dedupe — guard against duplicate API responses
      const seen = new Set<string>();
      const unique: FormSubmission[] = [];
      for (const item of list) {
        // Ensure key is a string (especially for ObjectIds)
        const key = String(item._id || item.id || "");
        if (key && !seen.has(key)) {
          seen.add(key);
          unique.push({
            ...item,
            id: key // Normalize ID to string
          });
        }
      }
      setSubmissions(unique);
    } catch (err) {
      setApiOffline(true);
      const historyData = localStorage.getItem("formHistory");
      if (historyData) {
        try {
          const history = JSON.parse(historyData);
          setSubmissions(Array.isArray(history) ? history : []);
        } catch (_) {
          setSubmissions([]);
        }
      } else {
        setSubmissions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [searchText, dateFrom, dateTo]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleView = (submission: FormSubmission) => {
    localStorage.setItem(
      "formData",
      JSON.stringify({
        answers: submission.answers,
        autoFilledFields: submission.autoFilledFields || [],
        status: submission.status,
        submittedAt: submission.dateFilled,
      })
    );
    navigate("/preview");
  };

  const handleEdit = (submission: FormSubmission) => {
    localStorage.setItem(
      "formData",
      JSON.stringify({
        answers: submission.answers,
        autoFilledFields: submission.autoFilledFields || [],
        status: "draft",
      })
    );
    navigate("/form");
  };

  const handleDownload = (submission: FormSubmission) => {
    generateAndDownloadPDF(
      submission.answers,
      submission.autoFilledFields || [],
      `Form-Submission-${submission.id || Date.now()}.pdf`
    ).catch(() => { });
  };

  const handlePrint = (submission: FormSubmission) => {
    previewPDF(submission.answers, submission.autoFilledFields || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form submission?")) return;
    const mongoId = submissions.find((s) => s.id === id || s._id === id)?._id || id;
    try {
      const res = await fetch(apiUrl(`/api/forms/${mongoId}`), {
        method: "DELETE",
        headers: apiHeaders
      });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id && s._id !== mongoId));
      } else {
        throw new Error("Delete failed");
      }
    } catch (_) {
      const updated = submissions.filter((s) => s.id !== id && s._id !== mongoId);
      setSubmissions(updated);
      localStorage.setItem("formHistory", JSON.stringify(updated));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      en: "English",
      hi: "हिन्दी",
      or: "ଓଡ଼ିଆ",
      ta: "தமிழ்",
      te: "తెలుగు",
    };
    return languages[code] || code;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#1a1a24]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Form History
          </h1>
          <p className="text-gray-400 text-lg mb-4">
            View, edit, or download your previously filled forms
          </p>

          {/* Search & Date filters - API par bhejte hain ($regex + date range) */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search by name, email, phone..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchHistory()}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-white/5 border-white/10 text-white w-auto"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-white/5 border-white/10 text-white w-auto"
            />
            <Button
              onClick={fetchHistory}
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
              Apply
            </Button>
          </div>

          {apiOffline && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 py-3 px-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-amber-300 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Server offline or network error. Showing local data.
            </motion.div>
          )}
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : submissions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
            id="history_empty_state"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-700/20 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Form History Yet
            </h3>
            <p className="text-gray-400 mb-6">
              Your filled forms will appear here. Start filling a new form to see your history.
            </p>
            <Button
              onClick={() => {
                localStorage.removeItem("formData");
                navigate("/upload-documents");
              }}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              Start Your First Form
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4" id="history_list_container">
            {submissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-all"
                id={`history_card_${submission.id}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-1 truncate">
                          {submission.formName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(submission.dateFilled)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            {getLanguageName(submission.language)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${submission.status === "finalized"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              }`}
                          >
                            {submission.status === "finalized" ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Finalized
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                Draft
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(submission)}
                      className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                      id={`btn_view_${submission.id}`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(submission)}
                      className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                      id={`btn_edit_${submission.id}`}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(submission)}
                      className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                      id={`btn_download_${submission.id}`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePrint(submission)}
                      className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(submission.id)}
                      className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
