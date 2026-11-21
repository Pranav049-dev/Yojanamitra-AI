"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { SchemeListItem, SchemeFilterOptions } from "@/types";
import SchemeCard from "@/components/SchemeCard";
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  RotateCcw, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  BookOpen
} from "lucide-react";

function SchemesDiscoveryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search and filter states
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";
  const initialState = searchParams.get("state") || "All";
  const initialGovLevel = searchParams.get("government_level") || "All";
  const initialBeneficiary = searchParams.get("beneficiary_category") || "All";
  const initialSort = searchParams.get("sort_by") || "name_asc";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [state, setState] = useState(initialState);
  const [govLevel, setGovLevel] = useState(initialGovLevel);
  const [beneficiary, setBeneficiary] = useState(initialBeneficiary);
  const [sortBy, setSortBy] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  const [filterOptions, setFilterOptions] = useState<SchemeFilterOptions>({
    categories: [],
    states: [],
    government_levels: ["Central", "State"],
    beneficiary_categories: [],
  });

  const [schemes, setSchemes] = useState<SchemeListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [limit] = useState(9);

  // Load filter options on mount
  useEffect(() => {
    api.getFilterOptions()
      .then((opts) => setFilterOptions(opts))
      .catch((err) => console.error("Filter options error:", err));
  }, []);

  // Fetch schemes when filter values change
  useEffect(() => {
    setLoading(true);
    api.getSchemes({
      q: query,
      category,
      state,
      government_level: govLevel,
      beneficiary_category: beneficiary,
      sort_by: sortBy,
      page,
      limit
    })
      .then((res) => {
        setSchemes(res.schemes);
        setTotalCount(res.total);
      })
      .catch((err) => console.error("Fetch schemes error:", err))
      .finally(() => setLoading(false));
  }, [query, category, state, govLevel, beneficiary, sortBy, page, limit]);

  const handleResetFilters = () => {
    setQuery("");
    setCategory("All");
    setState("All");
    setGovLevel("All");
    setBeneficiary("All");
    setSortBy("name_asc");
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wide">
          <BookOpen className="w-4 h-4" />
          <span>Central & State Knowledge Base</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Government Schemes</h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Search and filter verified government welfare initiatives across India with detailed eligibility rules, document checklists, and application guidelines.
        </p>
      </div>

      {/* Main Filter & Search Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        {/* Search input + Reset */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-grow flex items-center px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 gap-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search scheme name, keywords, benefits (e.g. Kisan, Ladli, Health, Pension)..."
              className="w-full text-sm outline-none bg-transparent"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="text-xs font-medium text-slate-700 bg-transparent outline-none cursor-pointer"
              >
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="verified">Recently Verified</option>
              </select>
            </div>

            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Sector</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 outline-none"
            >
              <option value="All">All Sectors</option>
              {filterOptions.categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">State / Scope</label>
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 outline-none"
            >
              <option value="All">All States (National)</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              {filterOptions.states.filter((s) => s !== "Madhya Pradesh" && s !== "All India").map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Government Tier</label>
            <select
              value={govLevel}
              onChange={(e) => {
                setGovLevel(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 outline-none"
            >
              <option value="All">Central & State</option>
              <option value="Central">Central Government</option>
              <option value="State">State Government</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Beneficiary Group</label>
            <select
              value={beneficiary}
              onChange={(e) => {
                setBeneficiary(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 outline-none"
            >
              <option value="All">All Beneficiaries</option>
              {filterOptions.beneficiary_categories.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing <strong className="text-slate-900">{schemes.length}</strong> of <strong className="text-slate-900">{totalCount}</strong> verified schemes
        </div>
        <div>
          Page {page} of {totalPages}
        </div>
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : schemes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No schemes matched your search criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing state filters, or selecting All Sectors.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-600 font-medium">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function SchemesPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2">Loading Scheme Knowledge Base...</p>
      </div>
    }>
      <SchemesDiscoveryContent />
    </Suspense>
  );
}
