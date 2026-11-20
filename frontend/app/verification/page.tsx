"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ClaimVerificationResponse } from "@/types";
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ExternalLink, 
  ArrowRight,
  Info,
  RotateCcw
} from "lucide-react";

export default function VerificationPage() {
  const [inputText, setInputText] = useState("");
  const [response, setResponse] = useState<ClaimVerificationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyClaim(inputText.trim());
      setResponse(res);
    } catch (err: any) {
      setError(err.message || "Failed to verify submission.");
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sample: string) => {
    setInputText(sample);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
          <span>Public Safety & Misinformation Defense</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Scam & Claim Verification</h1>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          Received a suspicious WhatsApp message, SMS, or social media post about free cash or welfare benefits? 
          Paste the message here. We cross-reference claims against verified government databases and identify known scam markers.
        </p>
      </div>

      {/* Safety Notice Warning */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong>Golden Rule of Citizen Digital Safety:</strong>
          <p className="leading-relaxed">
            The Government of India and State Governments NEVER ask for OTPs, bank passwords, ATM PINs, or registration fees to disburse welfare benefits. Official portals exclusively use <strong>.gov.in</strong> or <strong>.nic.in</strong> domains.
          </p>
        </div>
      </div>

      {/* Submission Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Paste Alleged Message, Claim, or WhatsApp Forward
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. Government is giving free ₹10,000 to all women under Ladli scheme. Pay ₹200 fee and send OTP to confirm registration immediately at bit.ly/free-money..."
              className="w-full p-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 leading-relaxed placeholder-slate-400"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            {/* Quick sample chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Test Samples:</span>
              <button
                type="button"
                onClick={() => handleSampleClick("Under PM-KISAN scheme, eligible farmer families receive 6,000 per year directly in bank accounts in three installments.")}
                className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700"
              >
                Genuine PM-KISAN
              </button>
              <button
                type="button"
                onClick={() => handleSampleClick("Urgent! Free housing loan of 5 lakhs approved by Modi Sarkar. Pay Rs. 500 processing charge and share OTP immediately at tinyurl.com/pm-awas-free.")}
                className="px-2 py-0.5 rounded-full bg-red-50 hover:bg-red-100 text-[11px] text-red-700 font-medium"
              >
                Suspicious Scam Example
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {loading ? "Cross-referencing Database..." : "Verify Claim Authenticity"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Verification Result Presentation */}
      {response && (
        <div className="space-y-6">
          {/* Overall Verdict Banner */}
          <div className={`p-6 rounded-3xl border shadow-sm space-y-3 ${
            response.overall_status === "VERIFIED_GENUINE"
              ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
              : response.overall_status === "SUSPECTED_SCAM"
              ? "bg-red-50 border-red-300 text-red-950"
              : response.overall_status === "MISLEADING_OR_FALSE"
              ? "bg-amber-50 border-amber-300 text-amber-950"
              : "bg-slate-50 border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                response.overall_status === "VERIFIED_GENUINE"
                  ? "bg-emerald-200 text-emerald-900"
                  : response.overall_status === "SUSPECTED_SCAM"
                  ? "bg-red-200 text-red-900 animate-pulse"
                  : "bg-amber-200 text-amber-900"
              }`}>
                {response.overall_status.replace(/_/g, " ")}
              </span>
            </div>

            <h3 className="font-extrabold text-xl">
              {response.overall_summary}
            </h3>

            {/* Critical Security Warnings */}
            {response.security_warnings.length > 0 && (
              <div className="p-3 bg-white/80 rounded-xl border border-red-200 space-y-1">
                <span className="font-bold text-xs text-red-800 uppercase tracking-wider">High Risk Scam Markers Detected:</span>
                {response.security_warnings.map((warn, wIdx) => (
                  <p key={wIdx} className="text-xs text-red-700 font-medium">
                    ⚠️ {warn}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Breakdown of Individual Claims */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900">Sentence-by-Sentence Evidence Breakdown</h3>

            <div className="space-y-4">
              {response.claim_breakdown.map((claim, cIdx) => (
                <div key={cIdx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-slate-400 font-semibold">Claim #{cIdx + 1}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      claim.verdict === "SUPPORTED"
                        ? "bg-emerald-100 text-emerald-800"
                        : claim.verdict === "FRAUD_ALERT"
                        ? "bg-red-100 text-red-800"
                        : claim.verdict === "CONFLICTING"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-200 text-slate-700"
                    }`}>
                      {claim.verdict_label}
                    </span>
                  </div>

                  <p className="font-semibold text-slate-900 italic">
                    &ldquo;{claim.claim_extracted}&rdquo;
                  </p>

                  <p className="text-slate-600 leading-relaxed font-normal">
                    {claim.analysis}
                  </p>

                  {claim.official_source_url && (
                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-500">Official Evidence: {claim.official_source_name || "Official Portal"}</span>
                      <a
                        href={claim.official_source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <span>Check Official Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Official Guidance Note */}
          <div className="p-4 bg-slate-100 rounded-2xl text-xs text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Government Guidance: </strong>{response.official_guidance}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
