import React from "react";
import Link from "next/link";
import { ShieldAlert, ExternalLink, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & Disclaimer */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                YM
              </div>
              <span className="text-white font-bold text-lg">YojanaMitra AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An AI-powered public interest research and discovery platform for Indian government schemes. Grounded in official Gazette, ministry notifications, and digital portals.
            </p>
            <div className="text-[11px] text-amber-300/80 bg-amber-950/40 border border-amber-800/40 p-2.5 rounded-md flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Independent platform. We never ask for Aadhaar OTPs, passwords, or registration fees.</span>
            </div>
          </div>

          {/* Column 2: Quick Features */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Core Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/schemes" className="hover:text-white transition-colors">Scheme Directory</Link></li>
              <li><Link href="/eligibility" className="hover:text-white transition-colors">Rule-Based Eligibility Engine</Link></li>
              <li><Link href="/assistant" className="hover:text-white transition-colors">AI Research Assistant (RAG)</Link></li>
              <li><Link href="/investigation" className="hover:text-white transition-colors">Scheme Investigation Engine</Link></li>
              <li><Link href="/verification" className="hover:text-white transition-colors">Scam & Claim Verification</Link></li>
              <li><Link href="/comparison" className="hover:text-white transition-colors">Scheme Comparison Matrix</Link></li>
            </ul>
          </div>

          {/* Column 3: Focus Regions */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Government Tiers</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/schemes?government_level=Central" className="hover:text-white transition-colors">Central Sector Schemes</Link></li>
              <li><Link href="/schemes?state=Madhya+Pradesh" className="hover:text-white transition-colors">Madhya Pradesh State Schemes</Link></li>
              <li><Link href="/schemes?category=Agriculture" className="hover:text-white transition-colors">Farmer Welfare & Agriculture</Link></li>
              <li><Link href="/schemes?category=Healthcare" className="hover:text-white transition-colors">Public Healthcare & Ayushman</Link></li>
              <li><Link href="/schemes?category=Women+%26+Child" className="hover:text-white transition-colors">Women Empowerment & Ladli Behna</Link></li>
            </ul>
          </div>

          {/* Column 4: Official Portals */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Official Authorities</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://www.myscheme.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  <span>myScheme National Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  <span>National Portal of India</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://mp.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  <span>Government of Madhya Pradesh</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  <span>PM-KISAN Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://nha.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  <span>National Health Authority</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} YojanaMitra AI. Built for citizen empowerment and public welfare awareness.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-slate-400">About Platform</Link>
            <span>•</span>
            <span className="flex items-center gap-1">Designed for India 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
