export interface User {
  id: number;
  name: string;
  email: string;
  preferred_language: string;
  state?: string;
  occupation?: string;
  annual_income?: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SchemeSource {
  id: number;
  source_name: string;
  source_url: string;
  source_type: string;
  publication_date?: string;
  reliability_status: string;
}

export interface SchemeDocument {
  name: string;
  is_mandatory: boolean;
  description?: string;
  is_collected?: boolean;
  notes?: string;
}

export interface SchemeCondition {
  field: string;
  operator: string;
  value: any;
  label?: string;
  failure_message?: string;
}

export interface SchemeDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  government_level: string;
  state: string;
  category: string;
  beneficiary_category: string;
  benefits: string;
  eligibility_rules: {
    conditions: SchemeCondition[];
  };
  required_documents: SchemeDocument[];
  application_steps: string[];
  official_url: string;
  verification_status: string;
  last_verified_at?: string;
  sources: SchemeSource[];
}

export interface SchemeListItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  government_level: string;
  state: string;
  category: string;
  beneficiary_category: string;
  benefits: string;
  official_url: string;
  verification_status: string;
}

export interface SchemeListResponse {
  total: number;
  page: number;
  limit: number;
  schemes: SchemeListItem[];
}

export interface SchemeFilterOptions {
  categories: string[];
  states: string[];
  government_levels: string[];
  beneficiary_categories: string[];
}

export interface UserEligibilityProfile {
  age?: number;
  gender?: string;
  state?: string;
  occupation?: string;
  occupation_sector?: string;
  family_annual_income?: number;
  has_cultivable_land?: boolean;
  family_landholding_acres?: number;
  is_income_tax_payer?: boolean;
  is_institutional_landholder?: boolean;
  secc_or_ration_card_eligible?: boolean;
  has_active_ayushman_card?: boolean;
  area_type?: string;
  has_pucca_house?: boolean;
  owns_motorized_vehicle?: boolean;
  has_four_wheeler?: boolean;
  business_type?: string;
  is_defaulter?: boolean;
  beneficiary_gender?: string;
  child_age?: number;
  accounts_per_family?: number;
  is_traditional_artisan?: boolean;
  has_govt_employee_in_family?: boolean;
  has_residential_electricity_connection?: boolean;
  has_suitable_roof?: boolean;
  bride_age?: number;
  groom_age?: number;
  is_mass_wedding_participant?: boolean;
  class_12_percentage?: number;
  extra_fields?: Record<string, any>;
}

export interface ConditionEvaluation {
  field: string;
  label: string;
  status: "PASSED" | "FAILED" | "UNKNOWN";
  user_value: any;
  expected_rule: string;
  message: string;
}

export interface SchemeEligibilityResult {
  scheme_id: number;
  scheme_name: string;
  scheme_slug: string;
  category: string;
  status: "POTENTIALLY_ELIGIBLE" | "MORE_INFO_REQUIRED" | "LIKELY_NOT_ELIGIBLE";
  status_label: string;
  status_color: string;
  summary_explanation: string;
  passed_conditions: ConditionEvaluation[];
  failed_conditions: ConditionEvaluation[];
  unknown_conditions: ConditionEvaluation[];
  disclaimer: string;
}

export interface EligibilityCheckResponse {
  evaluated_at: string;
  results: SchemeEligibilityResult[];
}

export interface SourceCitation {
  name: string;
  url: string;
  type: string;
  reliability: string;
  verified_date?: string;
}

export interface InvestigationReport {
  scheme_id: number;
  scheme_name: string;
  slug: string;
  overview: string;
  intended_beneficiaries: string;
  benefits_breakdown: string;
  eligibility_conditions: any[];
  required_documents: any[];
  application_process: string[];
  important_restrictions: string[];
  official_sources: SourceCitation[];
  verification_status: string;
  verification_badge: string;
  last_verified_at?: string;
  missing_information?: string;
  conflicting_information?: string;
  fraud_warnings: string[];
  audit_findings: string[];
  analysis_disclaimer: string;
}

export interface ClaimItemVerdict {
  claim_extracted: string;
  verdict: "SUPPORTED" | "UNSUPPORTED" | "CONFLICTING" | "UNVERIFIABLE" | "FRAUD_ALERT";
  verdict_label: string;
  confidence: number;
  analysis: string;
  matched_scheme?: string;
  official_source_url?: string;
  official_source_name?: string;
}

export interface ClaimVerificationResponse {
  submitted_text: string;
  overall_status: "VERIFIED_GENUINE" | "MISLEADING_OR_FALSE" | "SUSPECTED_SCAM" | "INCONCLUSIVE";
  overall_summary: string;
  security_warnings: string[];
  claim_breakdown: ClaimItemVerdict[];
  official_guidance: string;
}

export interface SchemeComparisonFeature {
  feature_name: string;
  feature_key: string;
  values: Record<number, any>;
}

export interface SchemeCompareResponse {
  schemes: Array<{
    id: number;
    name: string;
    slug: string;
    category: string;
    government_level: string;
    state: string;
    benefits: string;
    official_url: string;
  }>;
  matrix: SchemeComparisonFeature[];
  key_differences: string[];
  recommendation_summary: string;
}

export interface SchemeDocumentChecklist {
  scheme_id: number;
  scheme_name: string;
  total_documents: number;
  collected_count: number;
  percentage_complete: number;
  documents: SchemeDocument[];
}

export interface ChatCitation {
  scheme_id: number;
  scheme_name: string;
  official_url: string;
  source_name: string;
  relevance_snippet: string;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitation[];
  created_at: string;
}

export interface ChatResponse {
  session_id: number;
  message: ChatMessage;
  provider: string;
  provider_note?: string;
}
