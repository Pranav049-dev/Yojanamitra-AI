"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { InvestigationReport } from "@/types";
import { 
  FileSearch, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  ExternalLink, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  FileText,
  Calendar,
  Building,
  Check,
  Award
} from "lucide-react";

export default function InvestigationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const schemeId = params.id as string;

  const [report, setReport] = useState<InvestigationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schemeId) return;
    setLoading(true);
    api.getInvestigation(schemeId)
      .then((data) => setReport(data))
      .catch((err) => setError(err.message || "Failed to load investigation report."))
      .finally(() => setLoading(false));
  }, [schemeId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500">Compiling 11-point investigation report from official sources...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Investigation Report Unavailable</h2>
        <p className="text-sm text-slate-500">{error || "Could not generate report for the requested scheme ID."}</p>
        <Link href="/investigation" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
          Back to Reports Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Investigation Reports</span>
        </button>
      </div>

      {/* Main Report Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 border border-slate-800 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              {report.verification_badge}
            </span>
            <span className="text-xs text-slate-400">
              Audit Date: {report.last_verified_at ? new Date(report.last_verified_at).toLocaleDateString() : "Recent"}
            </span>
          </div>

          <Link
            href={`/schemes/${report.scheme_id}`}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>View Scheme Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-saffron-400">Public Interest Investigation Report</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {report.scheme_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            {report.overview}
          </p>
        </div>
      </div>

      {/* Audit Disclaimer Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
        <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Investigation Methodology:</strong> {report.analysis_disclaimer} All facts below are cross-referenced across Gazette publications, official government notifications, and National Portals (.gov.in / .nic.in).
        </p>
      </div>

      {/* 11 Structured Investigation Points */}
      <div className="space-y-6">
        {/* Point 1 & 2: Overview and Beneficiaries */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Building className="w-4 h-4" />
            <span>1. Intended Beneficiaries & Scope</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm font-semibold text-slate-800">
            {report.intended_beneficiaries}
          </div>
        </div>

        {/* Point 3: Benefits Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>2. Verified Financial & Welfare Benefits</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {report.benefits_breakdown}
          </p>
        </div>

        {/* Point 4: Eligibility Conditions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>3. Key Eligibility Conditions</span>
          </div>
          <div className="space-y-2">
            {report.eligibility_conditions.map((cond, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-xs text-slate-800">
                <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">{cond.label || cond.field}:</span>
                  <span className="text-slate-600 ml-1">Must satisfy rule: {cond.operator} {JSON.stringify(cond.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Point 5: Required Documents */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-purple-600" />
            <span>4. Mandatory & Supporting Documents</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.required_documents.map((doc, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{doc.name}</span>
                  {doc.is_mandatory && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-red-100 text-red-700">
                      Mandatory
                    </span>
                  )}
                </div>
                {doc.description && <p className="text-[11px] text-slate-500">{doc.description}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Point 6: Application Process */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <ExternalLink className="w-4 h-4 text-blue-600" />
            <span>5. Application Process & Channels</span>
          </div>
          <div className="space-y-2">
            {report.application_process.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="leading-relaxed font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Point 7: Important Restrictions */}
        <div className="bg-white rounded-2xl border border-red-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wider">
            <XCircle className="w-4 h-4 text-red-600" />
            <span>6. Important Restrictions & Grounds for Rejection</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 list-disc pl-5">
            {report.important_restrictions.map((res, idx) => (
              <li key={idx} className="leading-relaxed font-medium">{res}</li>
            ))}
          </ul>
        </div>

        {/* Point 8: Audit Findings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>7. Field Audit Findings & Observations</span>
          </div>
          <div className="space-y-2">
            {report.audit_findings.map((finding, idx) => (
              <div key={idx} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-900 leading-relaxed font-medium">
                • {finding}
              </div>
            ))}
          </div>
        </div>

        {/* Point 9 & 10: Fraud Alerts & Missing Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-amber-200 p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>8. Scam & Fraud Alerts</span>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              {report.fraud_warnings.map((warn, idx) => (
                <div key={idx} className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/60 leading-relaxed">
                  ⚠️ {warn}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>9. Missing or Unverified Information</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed p-3 bg-slate-50 rounded-xl border border-slate-100">
              {report.missing_information || "No major informational gaps identified in current gazette filings."}
            </p>
          </div>
        </div>

        {/* Point 11: Official Sources */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>10. Official Evidentiary Sources</span>
          </div>
          <div className="space-y-2">
            {report.official_sources.map((src, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">{src.name}</span>
                  <span className="text-[11px] text-slate-500 ml-2">({src.type})</span>
                </div>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>View Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
