"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { 
  UserEligibilityProfile, 
  EligibilityCheckResponse, 
  SchemeEligibilityResult, 
  SchemeListItem 
} from "@/types";
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  XCircle, 
  Sparkles, 
  ArrowRight, 
  FileSearch, 
  RotateCcw,
  Check,
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from "lucide-react";

function EligibilityCheckerContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const preselectedSchemeId = searchParams.get("scheme_id") ? parseInt(searchParams.get("scheme_id")!, 10) : undefined;

  const [schemes, setSchemes] = useState<SchemeListItem[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<number | undefined>(preselectedSchemeId);

  // Form State
  const [profile, setProfile] = useState<UserEligibilityProfile>({
    age: user?.occupation === "student" ? 19 : 32,
    gender: "female",
    state: user?.state || "Madhya Pradesh",
    occupation: user?.occupation || "farmer",
    family_annual_income: user?.annual_income || 180000,
    has_cultivable_land: true,
    family_landholding_acres: 2.5,
    is_income_tax_payer: false,
    is_institutional_landholder: false,
    secc_or_ration_card_eligible: true,
    area_type: "rural",
    has_pucca_house: false,
    owns_motorized_vehicle: false,
    has_four_wheeler: false,
    has_residential_electricity_connection: true,
    has_suitable_roof: true,
    is_traditional_artisan: false,
    has_govt_employee_in_family: false,
    business_type: "services",
    is_defaulter: false,
    class_12_percentage: 75
  });

  const [response, setResponse] = useState<EligibilityCheckResponse | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedScheme, setExpandedScheme] = useState<number | null>(null);

  useEffect(() => {
    api.getSchemes({ limit: 50 })
      .then((res) => setSchemes(res.schemes))
      .catch((err) => console.error(err));
  }, []);

  const handleEvaluate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEvaluating(true);
    setError(null);

    try {
      const res = await api.checkEligibility(profile, selectedSchemeId);
      setResponse(res);
      if (res.results.length > 0) {
        setExpandedScheme(res.results[0].scheme_id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to evaluate eligibility.");
    } finally {
      setEvaluating(false);
    }
  };

  // Run initial evaluation on load
  useEffect(() => {
    handleEvaluate();
  }, [selectedSchemeId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Deterministic Rule-Based Assessment</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Scheme Eligibility Engine</h1>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          Input your socio-economic profile. Our rules engine deterministically tracks satisfied conditions, unmet rules, and unknown variables without guessing missing data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Profile Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-bold text-base text-slate-900">Your Citizen Profile</h2>
            <button
              type="button"
              onClick={() => {
                setProfile({
                  age: 30,
                  gender: "female",
                  state: "Madhya Pradesh",
                  occupation: "farmer",
                  family_annual_income: 180000,
                  has_cultivable_land: true,
                  family_landholding_acres: 2.0,
                  is_income_tax_payer: false,
                  is_institutional_landholder: false,
                  secc_or_ration_card_eligible: true,
                  area_type: "rural",
                  has_pucca_house: false,
                  has_four_wheeler: false,
                  has_residential_electricity_connection: true,
                  has_suitable_roof: true
                });
                handleEvaluate();
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <form onSubmit={handleEvaluate} className="space-y-4 text-xs">
            {/* Target Scheme Filter */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Check Specific Scheme or All</label>
              <select
                value={selectedSchemeId || ""}
                onChange={(e) => setSelectedSchemeId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-medium outline-none"
              >
                <option value="">Evaluate Across All 12 Verified Schemes</option>
                {schemes.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Basic Demographics */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={profile.age ?? ""}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={profile.gender || ""}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value, beneficiary_gender: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* State & Area */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State of Residence</label>
                <select
                  value={profile.state || ""}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none"
                >
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Other">Other State</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Area Type</label>
                <select
                  value={profile.area_type || "rural"}
                  onChange={(e) => setProfile({ ...profile, area_type: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none"
                >
                  <option value="rural">Rural (Gram Panchayat)</option>
                  <option value="urban">Urban (Municipality)</option>
                </select>
              </div>
            </div>

            {/* Occupation & Income */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Occupation</label>
                <select
                  value={profile.occupation || "farmer"}
                  onChange={(e) => setProfile({ 
                    ...profile, 
                    occupation: e.target.value,
                    occupation_sector: e.target.value === "unorganized_worker" ? "unorganized" : "formal"
                  })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none"
                >
                  <option value="farmer">Farmer / Agriculturalist</option>
                  <option value="unorganized_worker">Unorganized Sector Labor</option>
                  <option value="artisan">Artisan / Handloom Craft</option>
                  <option value="student">Student / Scholar</option>
                  <option value="micro_business">Micro-Enterprise / Trade</option>
                  <option value="homemaker">Homemaker</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Annual Family Income (₹)</label>
                <input
                  type="number"
                  step="10000"
                  value={profile.family_annual_income ?? ""}
                  onChange={(e) => setProfile({ ...profile, family_annual_income: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none"
                />
              </div>
            </div>

            {/* Agricultural Land */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Owns Cultivable Land?</label>
                <select
                  value={profile.has_cultivable_land ? "true" : "false"}
                  onChange={(e) => setProfile({ ...profile, has_cultivable_land: e.target.value === "true" })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Land Size (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  value={profile.family_landholding_acres ?? 0}
                  onChange={(e) => setProfile({ ...profile, family_landholding_acres: e.target.value ? parseFloat(e.target.value) : 0 })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none"
                />
              </div>
            </div>

            {/* Disqualification checks */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="font-bold text-slate-700 block">Exclusion Filters</span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!profile.is_income_tax_payer}
                  onChange={(e) => setProfile({ ...profile, is_income_tax_payer: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0"
                />
                <span className="text-slate-600">Family member paid Income Tax last year</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!profile.has_four_wheeler}
                  onChange={(e) => setProfile({ ...profile, has_four_wheeler: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0"
                />
                <span className="text-slate-600">Family owns a 4-wheeler motor vehicle</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!profile.has_pucca_house}
                  onChange={(e) => setProfile({ ...profile, has_pucca_house: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0"
                />
                <span className="text-slate-600">Already owns a permanent Pucca house</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!profile.has_residential_electricity_connection}
                  onChange={(e) => setProfile({ ...profile, has_residential_electricity_connection: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0"
                />
                <span className="text-slate-600">Has active residential electricity meter</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={evaluating}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2"
            >
              {evaluating ? "Evaluating Rules..." : "Re-evaluate Eligibility Rules"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column: Evaluation Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {evaluating && (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 font-medium">Running rule evaluator engine across scheme conditions...</p>
            </div>
          )}

          {response && !evaluating && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Notice:</strong> This automated evaluation is for research guidance based on published government criteria. It does not constitute official government approval or guarantee benefit sanctions.
                </p>
              </div>

              <div className="space-y-4">
                {response.results.map((res) => {
                  const isExpanded = expandedScheme === res.scheme_id;
                  const isEligible = res.status === "POTENTIALLY_ELIGIBLE";
                  const isMoreInfo = res.status === "MORE_INFO_REQUIRED";

                  return (
                    <div
                      key={res.scheme_id}
                      className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                        isEligible
                          ? "border-emerald-300 shadow-sm"
                          : isMoreInfo
                          ? "border-amber-300"
                          : "border-slate-200"
                      }`}
                    >
                      <div
                        onClick={() => setExpandedScheme(isExpanded ? null : res.scheme_id)}
                        className="p-5 cursor-pointer flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              isEligible
                                ? "bg-emerald-100 text-emerald-800"
                                : isMoreInfo
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {res.status_label}
                            </span>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {res.category}
                            </span>
                          </div>

                          <h3 className="font-bold text-base text-slate-900">
                            {res.scheme_name}
                          </h3>

                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {res.summary_explanation}
                          </p>
                        </div>

                        <div className="shrink-0 pt-1 text-slate-400">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/40">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Condition Breakdown ({res.passed_conditions.length} passed, {res.failed_conditions.length} failed, {res.unknown_conditions.length} unknown)
                          </h4>

                          <div className="space-y-2">
                            {res.passed_conditions.map((cond, idx) => (
                              <div key={idx} className="p-3 bg-white rounded-xl border border-emerald-100 flex items-start gap-2.5 text-xs">
                                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-800">{cond.label}:</span>
                                  <span className="text-slate-600 ml-1">{cond.message}</span>
                                </div>
                              </div>
                            ))}

                            {res.failed_conditions.map((cond, idx) => (
                              <div key={idx} className="p-3 bg-white rounded-xl border border-red-100 flex items-start gap-2.5 text-xs">
                                <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                  <span className="font-bold text-red-800">{cond.label}:</span>
                                  <span className="text-red-700 ml-1">{cond.message}</span>
                                </div>
                              </div>
                            ))}

                            {res.unknown_conditions.map((cond, idx) => (
                              <div key={idx} className="p-3 bg-white rounded-xl border border-amber-100 flex items-start gap-2.5 text-xs">
                                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                  <span className="font-bold text-amber-800">{cond.label}:</span>
                                  <span className="text-amber-700 ml-1">{cond.message}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <Link
                              href={`/schemes/${res.scheme_id}`}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                            >
                              View Scheme Documents & Application Steps →
                            </Link>
                            <Link
                              href={`/investigation/${res.scheme_id}`}
                              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                            >
                              Investigation Report →
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EligibilityPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2">Loading Rule Engine...</p>
      </div>
    }>
      <EligibilityCheckerContent />
    </Suspense>
  );
}
