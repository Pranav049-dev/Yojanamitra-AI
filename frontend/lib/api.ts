import {
  AuthResponse,
  User,
  SchemeListResponse,
  SchemeDetail,
  SchemeListItem,
  SchemeFilterOptions,
  EligibilityCheckResponse,
  UserEligibilityProfile,
  InvestigationReport,
  ClaimVerificationResponse,
  SchemeCompareResponse,
  SchemeDocumentChecklist,
  ChatResponse,
  SchemeDocument
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://karen-refurbished-null-signature.trycloudflare.com/api";

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("yojanamitra_token");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
    } catch {
      errorDetail = `${response.status} ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Health
  getHealth: () => request<{ status: string; app_name: string; database: string }>("/health"),

  // Auth
  register: (data: { name: string; email: string; password: string; state?: string; preferred_language?: string; occupation?: string; annual_income?: number }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  getMe: () => request<User>("/auth/me"),
  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),

  // Schemes
  getSchemes: (params: { q?: string; category?: string; state?: string; government_level?: string; beneficiary_category?: string; sort_by?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "" && v !== "All") {
        searchParams.append(k, String(v));
      }
    });
    return request<SchemeListResponse>(`/schemes?${searchParams.toString()}`);
  },

  getScheme: (id: number | string) => request<SchemeDetail>(`/schemes/${id}`),

  searchSchemes: (q: string) => request<SchemeListItem[]>(`/schemes/search?q=${encodeURIComponent(q)}`),

  getCategories: () => request<string[]>("/categories"),
  getStates: () => request<string[]>("/states"),
  getFilterOptions: () => request<SchemeFilterOptions>("/filter-options"),

  // Eligibility
  checkEligibility: (profile: UserEligibilityProfile, scheme_id?: number) =>
    request<EligibilityCheckResponse>("/eligibility/check", {
      method: "POST",
      body: JSON.stringify({ scheme_id, profile }),
    }),

  // Saved Schemes
  getSavedSchemes: () => request<SchemeListItem[]>("/saved-schemes"),
  saveScheme: (scheme_id: number) =>
    request<{ message: string; id: number }>("/saved-schemes", {
      method: "POST",
      body: JSON.stringify({ scheme_id }),
    }),
  removeSavedScheme: (scheme_id: number) =>
    request<{ message: string }>(`/saved-schemes/${scheme_id}`, { method: "DELETE" }),

  // AI Assistant
  sendChatMessage: (content: string, session_id?: number, language: string = "en") =>
    request<ChatResponse>("/assistant/chat", {
      method: "POST",
      body: JSON.stringify({ content, session_id, language }),
    }),

  // Investigation
  getInvestigation: (scheme_id: number | string) =>
    request<InvestigationReport>(`/investigation/${scheme_id}`),

  // Comparison
  compareSchemes: (scheme_ids: number[]) =>
    request<SchemeCompareResponse>("/schemes/compare", {
      method: "POST",
      body: JSON.stringify({ scheme_ids }),
    }),

  // Documents
  getDocuments: (scheme_id: number | string) =>
    request<SchemeDocumentChecklist>(`/schemes/${scheme_id}/documents`),

  updateDocumentProgress: (scheme_id: number | string, document_name: string, is_collected: boolean, notes?: string) =>
    request<SchemeDocument>(`/schemes/${scheme_id}/documents/progress`, {
      method: "PUT",
      body: JSON.stringify({ document_name, is_collected, notes }),
    }),

  // Verification / Scam Checker
  verifyClaim: (text: string) =>
    request<ClaimVerificationResponse>("/verification/check", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  // Profile
  getProfile: () => request<User>("/profile"),
  updateProfile: (data: Partial<User>) =>
    request<User>("/profile", { method: "PUT", body: JSON.stringify(data) }),
};
