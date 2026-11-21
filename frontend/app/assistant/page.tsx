"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { ChatMessage, ChatCitation } from "@/types";
import { 
  Bot, 
  Send, 
  User as UserIcon, 
  ExternalLink, 
  Sparkles, 
  ShieldAlert, 
  Globe2, 
  FileText,
  RotateCcw,
  Info
} from "lucide-react";

export default function AssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content: "Namaste! I am YojanaMitra AI, your personal government scheme research assistant. Ask me questions about eligibility, financial benefits, or documents for Indian central and state welfare programs (in English or हिन्दी).",
      created_at: new Date().toISOString()
    }
  ]);

  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [sessionId, setSessionId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string>("local_rag_search");
  const [providerNote, setProviderNote] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput("");

    // Add user message to UI immediately
    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: userQuery,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.sendChatMessage(userQuery, sessionId, language);
      setSessionId(res.session_id);
      setActiveProvider(res.provider);
      if (res.provider_note) {
        setProviderNote(res.provider_note);
      }
      setMessages((prev) => [...prev, res.message]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Error: ${err.message || "Could not retrieve response from AI service."}`,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner and Language Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-slate-900">YojanaMitra AI Assistant</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                RAG Grounded
              </span>
            </div>
            <p className="text-xs text-slate-500">Cites official government databases • Zero halluncinations</p>
          </div>
        </div>

        {/* Language & Session Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded-lg transition-colors ${
                language === "en" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("hi")}
              className={`px-3 py-1 rounded-lg transition-colors ${
                language === "hi" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              हिन्दी
            </button>
          </div>

          <button
            onClick={() => {
              setMessages([
                {
                  id: Date.now(),
                  role: "assistant",
                  content: language === "hi" 
                    ? "नमस्ते! मैं योजनामित्र एआई हूँ। आप मुझसे सरकारी योजनाओं के बारे में कोई भी प्रश्न पूछ सकते हैं।"
                    : "Chat history cleared. How may I assist you with Indian government welfare schemes today?",
                  created_at: new Date().toISOString()
                }
              ]);
              setSessionId(undefined);
            }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            title="Start new chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Provider Status Note */}
      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Transparency Disclosure: </strong>
          {providerNote || "Operating in verified search-grounded mode (Local RAG). Answers are synthesized directly from verified database records with source citations."}
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm h-[520px] flex flex-col overflow-hidden">
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser ? "bg-blue-600 text-white" : "bg-purple-100 text-purple-700"
                }`}>
                  {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div className={`space-y-3 ${isUser ? "text-right" : "text-left"}`}>
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none whitespace-pre-line"
                  }`}>
                    {msg.content}
                  </div>

                  {/* Citations if assistant message */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5 text-left">
                      <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Source Citations ({msg.citations.length})</span>
                      </div>
                      <div className="space-y-1">
                        {msg.citations.map((cite, cIdx) => (
                          <div key={cIdx} className="text-xs text-slate-600 flex items-center justify-between gap-2">
                            <span className="font-medium truncate">{cite.scheme_name}</span>
                            <a
                              href={cite.official_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 shrink-0"
                            >
                              <span>Official Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 text-slate-500 border border-slate-200/80 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping"></span>
                <span>Retrieving verified scheme clauses and formulating cited response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Prompts */}
        <div className="px-6 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-600">
          <span className="shrink-0 font-semibold text-slate-400">Suggestions:</span>
          {[
            "Who is eligible for PM-KISAN ₹6,000?",
            "What documents are needed for Ladli Behna Yojana?",
            "Can I get ₹5 lakh free hospital care?",
            "How does PM Surya Ghar solar subsidy work?"
          ].map((prompt, pIdx) => (
            <button
              key={pIdx}
              type="button"
              onClick={() => handleSuggestion(prompt)}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-700 shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Field */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === "hi"
                ? "सरकारी योजनाओं के बारे में पूछें (जैसे: लाड़ली बहना, किसान सम्मान निधि)..."
                : "Ask about eligibility, documents, or application steps..."
            }
            className="flex-grow px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
