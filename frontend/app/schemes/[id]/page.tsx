"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { SchemeDetail, SchemeDocumentChecklist } from "@/types";
import { 
  Building2, 
  MapPin, 
  Award, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  Bookmark, 
  FileSearch, 
  Calendar, 
  CheckSquare, 
  Square,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Share2
} from "lucide-react";

export default function SchemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const schemeId = params.id as string;

  const [scheme, setScheme] = useState<SchemeDetail | null>(null);
  const [checklist, setChecklist] = useState<SchemeDocumentChecklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "eligibility" | "documents" | "process" | "sources">("overview");

  const [isSaved, setIsSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);

  useEffect(() => {
    if (!schemeId) return;

    setLoading(true);
    Promise.all([
      api.getScheme(schemeId),
      api.getDocuments(schemeId).catch(() => null),
      user ? api.getSavedSchemes().catch(() => []) : Promise.resolve([])
    ])
      .then(([schemeData, docData, savedList]) => {
        setScheme(schemeData);
        setChecklist(docData);
        if (savedList && Array.isArray(savedList)) {
          setIsSaved(savedList.some((s: any) => s.id === Number(schemeId)));
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load scheme details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [schemeId, user]);

  const handleToggleDocProgress = async (docName: string, currentStatus: boolean) => {
    if (!user) {
      alert("Please sign in to save your checklist progress.");
      return;
    }

    try {
      await api.updateDocumentProgress(schemeId, docName, !currentStatus);
      // Refresh documents checklist
      const updated = await api.getDocuments(schemeId);
      setChecklist(updated);
    } catch (err: any) {
      alert(err.message || "Failed to update document status.");
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      alert("Please sign in to save schemes.");
      return;
    }
    setSavingBookmark(true);
    try {
      if (isSaved) {
        await api.removeSavedScheme(Number(schemeId));
        setIsSaved(false);
      } else {
        await api.saveScheme(Number(schemeId));
        setIsSaved(true);
      }
    } catch (err: any) {
      alert(err.message || "Failed to bookmark scheme.");
    } finally {
      setSavingBookmark(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500">Loading scheme information from verified database...</p>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Scheme Not Found</h2>
        <p className="text-sm text-slate-500">{error || "The requested government scheme does not exist."}</p>
        <Link href="/schemes" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
          Return to Scheme Directory
        </Link>
      </div>
    );
  }

  const conditions = scheme.eligibility_rules?.conditions || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Schemes</span>
        </button>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              scheme.government_level === "Central"
                ? "bg-blue-100 text-blue-800"
                : "bg-emerald-100 text-emerald-800"
            }`}>
              {scheme.government_level} Government
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {scheme.state}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
              {scheme.category}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {scheme.verification_status.replace("_", " ")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmarkToggle}
              disabled={savingBookmark}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                isSaved
                  ? "bg-amber-50 text-amber-700 border-amber-300"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`} />
              <span>{isSaved ? "Saved" : "Save Scheme"}</span>
            </button>

            <Link
              href={`/investigation/${scheme.id}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              <FileSearch className="w-4 h-4 text-emerald-400" />
              <span>View Investigation Report</span>
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {scheme.name}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
            {scheme.description}
          </p>
        </div>

        {/* Benefits Highlight Callout */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-blue-50/40 border border-emerald-200/80 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wide">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Official Financial & Welfare Benefits</span>
          </div>
          <p className="text-sm font-semibold text-slate-800 leading-relaxed">
            {scheme.benefits}
          </p>
        </div>

        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Last Verified: {scheme.last_verified_at ? new Date(scheme.last_verified_at).toLocaleDateString() : "Recent"}</span>
          </div>
          <div>
            <a
              href={scheme.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Visit Official Government Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-4 text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-1 border-b-2 transition-colors shrink-0 ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Overview & Target
        </button>
        <button
          onClick={() => setActiveTab("eligibility")}
          className={`pb-3 px-1 border-b-2 transition-colors shrink-0 ${
            activeTab === "eligibility"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Eligibility Rules ({conditions.length})
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`pb-3 px-1 border-b-2 transition-colors shrink-0 ${
            activeTab === "documents"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Document Checklist ({checklist?.documents?.length || scheme.required_documents?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("process")}
          className={`pb-3 px-1 border-b-2 transition-colors shrink-0 ${
            activeTab === "process"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Application Procedure
        </button>
        <button
          onClick={() => setActiveTab("sources")}
          className={`pb-3 px-1 border-b-2 transition-colors shrink-0 ${
            activeTab === "sources"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Sources & Verification
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="font-bold text-base text-slate-900">Target Beneficiary Classification</h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Intended Group:</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{scheme.beneficiary_category}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500">Geographic Coverage:</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{scheme.state}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-base text-slate-900">Scheme Summary</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{scheme.description}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href={`/eligibility?scheme_id=${scheme.id}`}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              Evaluate My Eligibility for This Scheme
            </Link>
            <Link
              href={`/investigation/${scheme.id}`}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
            >
              Read Full Investigation Audit
            </Link>
          </div>
        </div>
      )}

      {/* Tab 2: Eligibility */}
      {activeTab === "eligibility" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Evaluated Eligibility Conditions</h3>
              <p className="text-xs text-slate-500">Every condition is evaluated deterministically by the rule engine.</p>
            </div>
            <Link
              href={`/eligibility?scheme_id=${scheme.id}`}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Run Instant Check →
            </Link>
          </div>

          <div className="space-y-3">
            {conditions.map((cond, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs text-slate-800">{cond.label || cond.field}</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                    operator: {cond.operator}
                  </span>
                </div>
                {cond.failure_message && (
                  <p className="text-xs text-slate-600 pl-6">
                    <span className="font-semibold text-slate-500">Requirement Note:</span> {cond.failure_message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Documents Checklist */}
      {activeTab === "documents" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-base text-slate-900">Required Documents Checklist</h3>
              <p className="text-xs text-slate-500">Track and prepare all mandatory papers prior to application.</p>
            </div>
            {checklist && (
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-700">
                  {checklist.collected_count} of {checklist.total_documents} Prepared ({checklist.percentage_complete}%)
                </span>
                <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${checklist.percentage_complete}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {(checklist?.documents || scheme.required_documents || []).map((doc, idx) => (
              <div
                key={idx}
                onClick={() => handleToggleDocProgress(doc.name, !!doc.is_collected)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  doc.is_collected
                    ? "bg-emerald-50/60 border-emerald-200"
                    : "bg-slate-50/50 border-slate-100 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-slate-400">
                    {doc.is_collected ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 hover:text-blue-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${doc.is_collected ? "text-emerald-900 line-through" : "text-slate-900"}`}>
                        {doc.name}
                      </span>
                      {doc.is_mandatory && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-red-100 text-red-700">
                          Mandatory
                        </span>
                      )}
                    </div>
                    {doc.description && (
                      <p className="text-xs text-slate-500">{doc.description}</p>
                    )}
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                  {doc.is_collected ? "Ready" : "Click to mark ready"}
                </span>
              </div>
            ))}
          </div>

          {!user && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 text-center">
              <Link href="/login" className="font-bold underline">Sign in</Link> to permanently save your checklist progress across sessions.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Process */}
      {activeTab === "process" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">Step-by-Step Application Procedure</h3>
            <p className="text-xs text-slate-500">Official procedure validated against gazette circulars.</p>
          </div>

          <div className="space-y-4">
            {scheme.application_steps?.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium pt-0.5">
                  {step}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <a
              href={scheme.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <span>Proceed to Application Portal ({scheme.official_url})</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Tab 5: Sources */}
      {activeTab === "sources" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">Official Source Citations</h3>
            <p className="text-xs text-slate-500">Every data field in this record is backed by verifiable documentation.</p>
          </div>

          <div className="space-y-3">
            {scheme.sources?.map((src) => (
              <div key={src.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{src.source_name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {src.reliability_status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Document Type: {src.source_type}</p>
                </div>
                <a
                  href={src.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 shrink-0"
                >
                  <span>Verify Document</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
