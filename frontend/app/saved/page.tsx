"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { SchemeListItem } from "@/types";
import SchemeCard from "@/components/SchemeCard";
import { Bookmark, Search, ArrowRight, ShieldCheck } from "lucide-react";

export default function SavedSchemesPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [savedSchemes, setSavedSchemes] = useState<SchemeListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login");
      return;
    }

    if (token) {
      api.getSavedSchemes()
        .then((data) => setSavedSchemes(data))
        .catch((err) => console.error("Error fetching saved schemes:", err))
        .finally(() => setLoading(false));
    }
  }, [token, isLoading, router]);

  const handleBookmarkToggle = (schemeId: number, isSaved: boolean) => {
    if (!isSaved) {
      setSavedSchemes((prev) => prev.filter((s) => s.id !== schemeId));
    }
  };

  if (isLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500">Loading your saved schemes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-amber-500" />
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved Welfare Schemes</h1>
          </div>
          <p className="text-sm text-slate-500">Manage your bookmarked schemes and track document preparations.</p>
        </div>

        <Link
          href="/schemes"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Explore More Schemes</span>
        </Link>
      </div>

      {savedSchemes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center space-y-4">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">No Saved Schemes Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Click the bookmark icon on any scheme card to save it here for offline tracking, document readiness, and quick eligibility checks.
          </p>
          <Link
            href="/schemes"
            className="inline-block px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-xs shadow-sm hover:bg-blue-700 transition-colors"
          >
            Browse Verified Scheme Directory
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              isSavedInitial={true}
              onBookmarkToggle={handleBookmarkToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
