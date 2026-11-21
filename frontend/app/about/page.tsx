import React from "react";
import Link from "next/link";
import { ShieldCheck, Target, Award, Users, FileText, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Independent Public Welfare Platform</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">About YojanaMitra AI</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Discover. Understand. Investigate. Benefit.
        </p>
      </div>

      {/* Vision & Problem */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900">The Problem We Are Solving</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Millions of Indian citizens across states and rural districts are unaware of government schemes that could dramatically improve their livelihoods, healthcare, farming output, and children&apos;s education.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Citizens struggle to understand dense legal notifications, identify exact document requirements, discern genuine portals from fraudulent clone sites, and navigate eligibility without paying predatory middlemen.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-xs text-slate-900">Deterministic Engine</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Rules are evaluated explicitly. Missing user information is never assumed as a disqualification.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-xs text-slate-900">Verified Evidence</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every scheme clause links to primary Gazette notifications, ministry circulars, and official .gov.in portals.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <Award className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-xs text-slate-900">RAG AI Assistant</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Retrieval-Augmented Generation synthesizes clear answers in Hindi and English without hallucinating.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-6 bg-slate-900 text-slate-300 rounded-3xl space-y-3 border border-slate-800 text-xs">
        <span className="font-bold text-white uppercase tracking-wider block">Official Disclaimer</span>
        <p className="leading-relaxed">
          YojanaMitra AI is an independent civic research and discovery platform. We are not an official government department, agency, or ministry. 
          We never collect Aadhaar numbers, OTPs, bank credentials, or application fees. Always execute final benefit applications directly on authorized official portals (.gov.in / .nic.in).
        </p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/schemes"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          <span>Explore Verified Scheme Knowledge Base</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
