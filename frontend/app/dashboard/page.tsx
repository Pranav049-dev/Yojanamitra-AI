"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { SchemeListItem, User } from "@/types";
import SchemeCard from "@/components/SchemeCard";
import { 
  User as UserIcon, 
  Search, 
  Bookmark, 
  CheckCircle2, 
  Bot, 
  FileSearch, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  MapPin,
  Briefcase,
  AlertCircle
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  const [savedSchemes, setSavedSchemes] = useState<SchemeListItem[]>([]);
  const [recommendedSchemes, setRecommendedSchemes] = useState<SchemeListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login");
      return;
    }

    if (token) {
      Promise.all([
        api.getSavedSchemes().catch(() => []),
        api.getSchemes({ limit: 4, sort_by: "verified" }).then((r) => r.schemes).catch(() => [])
      ])
        .then(([saved, recs]) => {
          setSavedSchemes(saved);
          setRecommendedSchemes(recs);
        })
        .finally(() => {
          setLoadingData(false);
        });
    }
  }, [token, isLoading, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/schemes?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (isLoading || loadingData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500">Loading your citizen dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-govnavy-900 via-blue-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>

        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Citizen Profile</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name || "Citizen"}!
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Your centralized portal to investigate, track document requirements, and verify eligibility for official government schemes in {user?.state || "Madhya Pradesh"}.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              State: <strong className="text-white">{user?.state || "Madhya Pradesh"}</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              Occupation: <strong className="text-white capitalize">{user?.occupation?.replace("_", " ") || "Farmer"}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Search & Shortcuts Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Search Government Schemes</h3>
            <p className="text-xs text-slate-500 mb-4">Discover verified central and Madhya Pradesh welfare programs.</p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-grow flex items-center px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 gap-2.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Ladli Behna, PM-KISAN, Housing..."
                  className="w-full text-sm outline-none bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors shrink-0"
              >
                Search
              </button>
            </form>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Browse by sector:</span>
            <div className="flex gap-2">
              <Link href="/schemes?category=Agriculture" className="hover:text-blue-600 font-medium">Agriculture</Link>
              <span>•</span>
              <Link href="/schemes?category=Healthcare" className="hover:text-blue-600 font-medium">Healthcare</Link>
              <span>•</span>
              <Link href="/schemes?category=Women+%26+Child" className="hover:text-blue-600 font-medium">Women</Link>
            </div>
          </div>
        </div>

        {/* Shortcuts Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-base text-slate-900">Quick Tools</h3>
          <div className="space-y-2">
            <Link
              href="/eligibility"
              className="p-3 rounded-xl border border-slate-100 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-950 flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900">Eligibility Checker</div>
                  <div className="text-[11px] text-slate-500">Run rule evaluation on your profile</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/assistant"
              className="p-3 rounded-xl border border-slate-100 bg-purple-50/50 hover:bg-purple-50 text-purple-950 flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Bot className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900">AI Scheme Assistant</div>
                  <div className="text-[11px] text-slate-500">Ask in English or Hindi</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/verification"
              className="p-3 rounded-xl border border-slate-100 bg-amber-50/50 hover:bg-amber-50 text-amber-950 flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900">Scam & Claim Checker</div>
                  <div className="text-[11px] text-slate-500">Verify suspicious WhatsApp messages</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Saved Schemes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900">Your Bookmarked Schemes</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {savedSchemes.length}
            </span>
          </div>
          {savedSchemes.length > 0 && (
            <Link href="/saved" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
              Manage Bookmarks →
            </Link>
          )}
        </div>

        {savedSchemes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-medium text-slate-600">You haven&apos;t bookmarked any schemes yet.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Save schemes to your dashboard to track required document checklists and application milestones.
            </p>
            <Link
              href="/schemes"
              className="inline-block px-4 py-2 bg-blue-50 text-blue-700 font-semibold text-xs rounded-lg hover:bg-blue-100 transition-colors"
            >
              Browse Verified Schemes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedSchemes.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                isSavedInitial={true}
                onBookmarkToggle={(id, isSaved) => {
                  if (!isSaved) {
                    setSavedSchemes((prev) => prev.filter((s) => s.id !== id));
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recommended Schemes Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Recommended for Your Profile</h2>
          </div>
          <Link href="/schemes" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
            View All ({recommendedSchemes.length}+) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedSchemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      </div>
    </div>
  );
}
