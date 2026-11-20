"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { SchemeListItem, SchemeCompareResponse } from "@/types";
import { 
  GitCompare, 
  Plus, 
  X, 
  ExternalLink, 
  FileSearch, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function SchemeComparisonPage() {
  const [allSchemes, setAllSchemes] = useState<SchemeListItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [comparison, setComparison] = useState<SchemeCompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getSchemes({ limit: 50 })
      .then((res) => {
        setAllSchemes(res.schemes);
        // Default select first two schemes for immediate comparison
        if (res.schemes.length >= 2) {
          const defaults = [res.schemes[0].id, res.schemes[1].id];
          setSelectedIds(defaults);
          fetchComparison(defaults);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchComparison = async (ids: number[]) => {
    if (ids.length < 2) {
      setComparison(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.compareSchemes(ids);
      setComparison(res);
    } catch (err: any) {
      setError(err.message || "Failed to compare selected schemes.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleScheme = (id: number) => {
    let updated: number[];
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) {
        alert("Please keep at least 2 schemes selected to compare.");
        return;
      }
      updated = selectedIds.filter((item) => item !== id);
    } else {
      if (selectedIds.length >= 4) {
        alert("You can compare a maximum of 4 schemes simultaneously.");
        return;
      }
      updated = [...selectedIds, id];
    }
    setSelectedIds(updated);
    fetchComparison(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
          <GitCompare className="w-3.5 h-3.5" />
          <span>Cross-Sector Welfare Comparison</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Scheme Comparison Matrix</h1>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          Select between 2 and 4 central or state government welfare schemes to compare benefits, target beneficiaries, eligibility barriers, and official application portals side-by-side.
        </p>
      </div>

      {/* Selector Pills Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-wider">
            Select Schemes to Compare ({selectedIds.length}/4 selected)
          </span>
          <span className="text-slate-400">Click to add/remove</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {allSchemes.map((s) => {
            const isSelected = selectedIds.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => handleToggleScheme(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{s.name.split("(")[0].trim()}</span>
                {isSelected ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3 text-slate-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Generating comparison matrix across features...</p>
        </div>
      )}

      {/* Comparison Matrix Table */}
      {comparison && !loading && (
        <div className="space-y-6">
          {/* Key Differences Summary Callout */}
          {comparison.key_differences.length > 0 && (
            <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2 text-xs text-blue-950">
              <span className="font-bold uppercase tracking-wider text-blue-800">Key Analytical Differences:</span>
              <ul className="list-disc pl-5 space-y-1">
                {comparison.key_differences.map((diff, dIdx) => (
                  <li key={dIdx} className="font-medium leading-relaxed">{diff}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white border-b border-slate-800">
                    <th className="p-4 font-bold uppercase tracking-wider w-1/4">Feature / Metric</th>
                    {comparison.schemes.map((s) => (
                      <th key={s.id} className="p-4 font-bold border-l border-slate-800 align-top">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-800 text-blue-200">
                            {s.category}
                          </span>
                          <div className="text-sm font-bold text-white line-clamp-2">{s.name}</div>
                          <div className="pt-1 flex items-center gap-2">
                            <Link
                              href={`/schemes/${s.id}`}
                              className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 underline"
                            >
                              Details
                            </Link>
                            <span>•</span>
                            <Link
                              href={`/investigation/${s.id}`}
                              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline"
                            >
                              Audit Report
                            </Link>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparison.matrix.map((row, rIdx) => (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="p-4 font-bold text-slate-800 align-top">
                        {row.feature_name}
                      </td>
                      {comparison.schemes.map((s) => {
                        const val = row.values[s.id];
                        const isUrl = typeof val === "string" && val.startsWith("http");

                        return (
                          <td key={s.id} className="p-4 border-l border-slate-100 align-top text-slate-700 leading-relaxed font-medium">
                            {isUrl ? (
                              <a
                                href={val}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <span>Official Portal</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span>{String(val || "N/A")}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
