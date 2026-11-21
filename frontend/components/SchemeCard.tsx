"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SchemeListItem } from "@/types";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { 
  Building2, 
  MapPin, 
  Award, 
  Bookmark, 
  ArrowRight, 
  FileSearch, 
  CheckCircle,
  ExternalLink 
} from "lucide-react";

interface SchemeCardProps {
  scheme: SchemeListItem;
  isSavedInitial?: boolean;
  onBookmarkToggle?: (schemeId: number, isSaved: boolean) => void;
}

export default function SchemeCard({ scheme, isSavedInitial = false, onBookmarkToggle }: SchemeCardProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please sign in to save schemes to your personal bookmark collection.");
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        await api.removeSavedScheme(scheme.id);
        setIsSaved(false);
        onBookmarkToggle?.(scheme.id, false);
      } else {
        await api.saveScheme(scheme.id);
        setIsSaved(true);
        onBookmarkToggle?.(scheme.id, true);
        setSaveMessage("Saved!");
        setTimeout(() => setSaveMessage(null), 2000);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update bookmark.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        {/* Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              scheme.government_level === "Central"
                ? "bg-blue-100 text-blue-800"
                : "bg-emerald-100 text-emerald-800"
            }`}>
              {scheme.government_level}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              {scheme.state}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
              {scheme.category}
            </span>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            disabled={saving}
            className={`p-1.5 rounded-md transition-colors ${
              isSaved 
                ? "text-amber-600 bg-amber-50 hover:bg-amber-100" 
                : "text-slate-400 hover:text-blue-600 hover:bg-slate-100"
            }`}
            title={isSaved ? "Remove from bookmarks" : "Save scheme"}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`} />
          </button>
        </div>

        {/* Scheme Name */}
        <Link href={`/schemes/${scheme.id}`} className="block group-hover:text-blue-600 transition-colors">
          <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-2 mb-2">
            {scheme.name}
          </h3>
        </Link>

        {/* Target Beneficiary */}
        <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
          <span className="font-semibold text-slate-700">Target:</span> {scheme.beneficiary_category}
        </p>

        {/* Benefits Preview */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-2">
          <div className="flex items-start gap-1.5 text-xs text-slate-700">
            <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed font-medium">
              {scheme.benefits}
            </p>
          </div>
        </div>

        {saveMessage && (
          <span className="text-xs text-emerald-600 font-semibold">{saveMessage}</span>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
        <Link
          href={`/investigation/${scheme.id}`}
          className="text-slate-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
        >
          <FileSearch className="w-3.5 h-3.5 text-slate-500" />
          <span>Investigate</span>
        </Link>

        <Link
          href={`/schemes/${scheme.id}`}
          className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
