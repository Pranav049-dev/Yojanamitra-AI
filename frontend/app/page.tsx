"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { SchemeListItem } from "@/types";
import SchemeCard from "@/components/SchemeCard";
import { 
  Search, 
  CheckCircle2, 
  FileSearch, 
  ShieldCheck, 
  Bot, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Building, 
  TrendingUp, 
  ShieldAlert,
  HelpCircle,
  FolderLock
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredSchemes, setFeaturedSchemes] = useState<SchemeListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSchemes({ limit: 6, sort_by: "verified" })
      .then((res) => {
        setFeaturedSchemes(res.schemes);
      })
      .catch((err) => {
        console.error("Error fetching featured schemes:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/schemes?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/schemes");
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-govnavy-900 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative background patterns */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          {/* Tagline Badge with Indian flag subtle accents */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold tracking-wide text-slate-200">
            <span className="w-2 h-2 rounded-full bg-saffron-500"></span>
            <span>Discover. Understand. Investigate. Benefit.</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>

          {/* Required Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Government Benefits,{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Made Easier to Discover.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            YojanaMitra AI is your personal government scheme research assistant. 
            Evaluate eligibility through automated rule-engines, investigate genuine benefits, and detect fraudulent scheme forwards.
          </p>

          {/* Interactive Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto">
            <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-slate-100">
              <div className="flex-grow flex items-center px-4 py-2 text-slate-800 gap-3">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by scheme name, category (e.g. Kisan, Ladli Behna, Ayushman)..."
                  className="w-full text-sm sm:text-base outline-none bg-transparent placeholder-slate-400"
                />
              </div>
              <button
                type="submit"
                className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Search Schemes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
              <span>Popular searches:</span>
              {["PM-KISAN", "Ladli Behna", "Ayushman Bharat", "Mudra Loan", "Sambal Yojana", "PM Surya Ghar"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    router.push(`/schemes?q=${encodeURIComponent(tag)}`);
                  }}
                  className="px-2.5 py-1 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                >
                  {tag}
                </button>
              ))}
            </div>
          </form>

          {/* Quick Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/schemes"
              className="px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-2 text-sm"
            >
              <Search className="w-4 h-4 text-blue-600" />
              <span>Explore All Schemes</span>
            </Link>
            <Link
              href="/eligibility"
              className="px-6 py-3 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white font-semibold transition-colors shadow-sm flex items-center gap-2 text-sm border border-blue-500/40"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Check My Eligibility</span>
            </Link>
            <Link
              href="/verification"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors shadow-sm flex items-center gap-2 text-sm border border-slate-700"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Verify WhatsApp Claim</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Metric Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl font-extrabold text-blue-600">100%</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-900">Verified Official Sources</div>
            <div className="text-xs text-slate-500">Gazette & Ministry Portals</div>
          </div>
          <div className="space-y-1 border-l border-slate-100">
            <div className="text-3xl font-extrabold text-emerald-600">Rule-Based</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-900">Deterministic Engine</div>
            <div className="text-xs text-slate-500">Zero Guesswork Evaluation</div>
          </div>
          <div className="space-y-1 border-l border-slate-100">
            <div className="text-3xl font-extrabold text-purple-600">Central & State</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-900">Madhya Pradesh Focus</div>
            <div className="text-xs text-slate-500">Catering to Rural & Urban</div>
          </div>
          <div className="space-y-1 border-l border-slate-100">
            <div className="text-3xl font-extrabold text-saffron-600">Zero Toll</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-900">100% Free Public Access</div>
            <div className="text-xs text-slate-500">No Hidden Processing Fees</div>
          </div>
        </div>
      </section>

      {/* Featured Schemes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Active Welfare Programs</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Government Schemes</h2>
            <p className="text-sm text-slate-600 mt-1">High-impact welfare schemes verified against latest 2026 notifications.</p>
          </div>
          <Link
            href="/schemes"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0"
          >
            <span>View All Schemes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold tracking-wider text-saffron-500 uppercase">Seamless Citizen Workflow</span>
            <h2 className="text-3xl font-bold text-white">How YojanaMitra AI Empowers You</h2>
            <p className="text-sm text-slate-400">Step-by-step guidance from discovery to real welfare disbursal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="font-bold text-lg text-white">Search & Discover</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter across 12+ verified categories, central and state tiers, income slabs, and occupations.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="font-bold text-lg text-white">Rule-Based Check</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your details to instantly evaluate eligibility conditions with honest explanation of unknown data.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="font-bold text-lg text-white">Investigate & Verify</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review deep investigation reports, official Gazette sources, past audit observations, and fake alerts.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-saffron-600/20 text-saffron-400 flex items-center justify-center font-bold text-lg">
                4
              </div>
              <h3 className="font-bold text-lg text-white">Checklist & Apply</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track your required documents step-by-step and navigate to the genuine .gov.in application portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Innovation Modules Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Platform Capabilities</span>
          <h2 className="text-3xl font-bold text-slate-900">Engineered for Transparency & Trust</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Scheme Investigation Reports</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every scheme has an in-depth 11-point investigative audit compiling intended beneficiaries, verified funding pipelines, common rejection grounds, and missing administrative details.
            </p>
            <Link href="/investigation" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span>Explore reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Scam & Claim Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit suspicious WhatsApp messages or social media forwards. The engine cross-references claims against verified government rules and immediately flags fraud patterns like OTP or fee demands.
            </p>
            <Link href="/verification" className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
              <span>Test claim checker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">RAG AI Research Assistant</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ask questions in simple English or Hindi. Powered by Retrieval-Augmented Generation that cites verifiable scheme clauses and never fabricates non-existent benefits.
            </p>
            <Link href="/assistant" className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1">
              <span>Chat with assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Safety Notice Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 border border-amber-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Public Advisory on Digital Safety</h3>
              <p className="text-xs text-slate-600 max-w-2xl mt-1 leading-relaxed">
                The Government of India and State Governments NEVER ask for OTPs, ATM PINs, bank passwords, or advance registration fees. 
                Always ensure you are submitting applications on official domains ending with <strong className="text-slate-800">.gov.in</strong> or <strong className="text-slate-800">.nic.in</strong>.
              </p>
            </div>
          </div>
          <Link
            href="/verification"
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shrink-0 shadow-sm"
          >
            Check a Suspicious Message
          </Link>
        </div>
      </section>
    </div>
  );
}
