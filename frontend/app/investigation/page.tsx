"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { SchemeListItem } from "@/types";
import { 
  FileSearch, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Search, 
  MapPin, 
  Award,
  ExternalLink 
} from "lucide-react";

export default function InvestigationIndexPage() {
  const [schemes, setSchemes] = useState<SchemeListItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSchemes({ limit: 50 })
      .then((res) => setSchemes(res.schemes))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = schemes.filter((s) => 
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.category.toLowerCase().includes(query.toLowerCase()) ||
    s.state.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-emerald-400 text-xs font-semibold">
          <FileSearch className="w-3.5 h-3.5" />
          <span>Independent Welfare Audit Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Scheme Investigation Reports</h1>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          Select any government scheme to review an exhaustive 11-point investigation report detailing verified funding structures, intended beneficiaries, strict exclusion criteria, and official source citations.
        </p>
      </div>

      {/* Filter / Search */}
      <div className="max-w-md flex items-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 gap-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter schemes to investigate..."
          className="w-full text-xs sm:text-sm outline-none bg-transparent"
        />
      </div>

      {/* Grid of Schemes with Investigation Badges */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-400 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {scheme.category}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">
                  {scheme.name}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {scheme.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {scheme.state}
                </span>

                <Link
                  href={`/investigation/${scheme.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <FileSearch className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Read Report</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
