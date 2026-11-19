# YojanaMitra AI (योजनामित्र AI)

> **Discover. Understand. Investigate. Benefit.**
> 
> AI-powered Indian Government Scheme Discovery, Investigation, and Public Safety Platform.

## Live Application

- **Public web app:** https://eco-gate-sampling-canyon.trycloudflare.com
- **Public API:** https://karen-refurbished-null-signature.trycloudflare.com
- **API documentation:** https://karen-refurbished-null-signature.trycloudflare.com/docs

---

## 1. Project Overview

**YojanaMitra AI** is an independent, transparent GovTech platform engineered to bridge the knowledge gap between Indian citizens and hundreds of Central and State Government welfare schemes. 

Millions of citizens—especially farmers, unorganized laborers, women, students, and micro-entrepreneurs—miss out on life-changing government benefits because criteria are complex, documents are poorly understood, or citizens fall victim to predatory WhatsApp scams demanding advance fees.

YojanaMitra AI solves this by functioning as a personal government scheme research assistant with:
- **Zero Guesswork Eligibility Engine**: Pure rule-based deterministic evaluation that never assumes missing user data means failure.
- **Deep Scheme Investigation Reports**: An 11-point evidentiary audit of funding pipelines, official Gazette notices, and known scam warnings.
- **Scam & Misinformation Checker**: Instant analysis of WhatsApp forwards against authentic government guidelines, with immediate detection of fee or OTP demands.
- **RAG-Grounded AI Research Assistant**: Retrieval-Augmented Generation that cites verifiable scheme clauses in English and हिन्दी, with an honest fallback when no LLM API key is present.
- **Document Readiness Checklist**: Step-by-step document tracking directly synced with user profiles.
- **Side-by-Side Scheme Comparison**: Multi-scheme feature matrix comparison across benefit amounts, tenures, and exclusions.

---

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (GovTech Palette: Deep Navy `#0B192C`, Government Blue `#1E40AF`, Saffron `#EA580C`, Emerald `#059669`)
- **Icons**: Lucide React
- **Client**: Centralized fetch API client with Bearer JWT token management
- **State**: React Context API (`AuthProvider`)

### Backend
- **Framework**: FastAPI (Python 3.13 / 3.11)
- **ORM & Database**: SQLAlchemy 2.0 with SQLite (local development default) & PostgreSQL 16 (production ready)
- **Validation**: Pydantic v2
- **Authentication**: JWT access tokens with bcrypt password hashing
- **Testing**: pytest suite (30 automated unit & integration tests)

### AI & Retrieval-Augmented Generation (RAG)
- **Vector & Lexical Engine**: TF-IDF & term-frequency vectorizer with BM25-inspired chunk retrieval and citation synthesis.
- **Configurable Provider Architecture**: Supports Google Gemini API (`gemini-1.5-flash`), OpenAI API (`gpt-4o-mini`), and local search-grounded mode (`local_rag_search`) with transparent disclosure.

---

## 3. Directory Layout

```
yojanamitra-ai/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app & lifespan startup
│   │   ├── seed_data.py             # Database seed loader & RAG indexer
│   │   ├── api/
│   │   │   ├── dependencies.py      # OAuth2 dependencies & current_user
│   │   │   └── routes/
│   │   │       ├── health.py        # /api/health
│   │   │       ├── auth.py          # /api/auth/register, /login, /me
│   │   │       ├── schemes.py       # /api/schemes, /categories, /states
│   │   │       ├── eligibility.py   # /api/eligibility/check
│   │   │       ├── saved.py         # /api/saved-schemes
│   │   │       ├── assistant.py     # /api/assistant/chat, /history
│   │   │       ├── investigation.py # /api/investigation/{id}
│   │   │       ├── comparison.py    # /api/schemes/compare
│   │   │       ├── documents.py     # /api/schemes/{id}/documents
│   │   │       ├── verification.py  # /api/verification/check
│   │   │       └── profile.py       # /api/profile
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic Settings
│   │   │   ├── security.py          # bcrypt & JWT
│   │   │   └── logging.py
│   │   ├── database/
│   │   │   ├── session.py           # SQLite/Postgres Engine
│   │   │   └── base.py
│   │   ├── models/                  # SQLAlchemy ORM Models
│   │   ├── schemas/                 # Pydantic v2 Schemas
│   │   └── services/
│   │       ├── scheme_service.py
│   │       ├── eligibility_service.py
│   │       ├── rag_service.py
│   │       ├── ai_service.py
│   │       ├── investigation_service.py
│   │       └── verification_service.py
│   ├── tests/                       # 30 automated backend tests
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 # Hero & Discovery Landing Page
│   │   ├── login/page.tsx           # Authentication
│   │   ├── register/page.tsx        # Registration
│   │   ├── dashboard/page.tsx       # User Dashboard
│   │   ├── schemes/                 # Discovery & Detail Pages
│   │   ├── eligibility/page.tsx     # Interactive Eligibility Engine
│   │   ├── assistant/page.tsx       # AI Research Assistant (EN & HI)
│   │   ├── investigation/           # Investigation Reports
│   │   ├── verification/page.tsx    # Scam & Misinformation Checker
│   │   ├── comparison/page.tsx      # Multi-Scheme Comparison
│   │   ├── saved/page.tsx           # Saved Bookmarks
│   │   ├── profile/page.tsx         # Citizen Profile
│   │   └── about/page.tsx           # About & Transparency
│   ├── components/
│   ├── lib/
│   │   ├── api.ts                   # Centralized API client
│   │   └── authContext.tsx          # User Session Context
│   ├── types/
│   └── package.json
├── data/
│   └── verified_schemes.json        # 12 Verified Central & MP Schemes
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 4. Verified Schemes Knowledge Base

The platform comes pre-seeded with 12 high-impact verified Indian government welfare programs:

### Central Sector Schemes
1. **Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)**: ₹6,000/yr in 3 installments to landholding farmers via DBT.
2. **Ayushman Bharat - PM-JAY**: ₹5,00,000 cashless secondary and tertiary health cover per family per year.
3. **Pradhan Mantri Awas Yojana - Gramin (PMAY-G)**: ₹1,20,000 to ₹1,30,000 unit assistance for rural pucca house construction.
4. **Pradhan Mantri Mudra Yojana (PMMY)**: Collateral-free micro-enterprise loans up to ₹10 lakh (Shishu, Kishore, Tarun).
5. **Sukanya Samriddhi Yojana (SSY)**: Sovereign girl-child savings scheme with 8.2% guaranteed tax-free returns.
6. **Atal Pension Yojana (APY)**: Guaranteed monthly pension of ₹1,000 to ₹5,000 for unorganized workers from age 60.
7. **PM Vishwakarma Scheme**: Toolkit incentive grant of ₹15,000 and concessional 5% loans for traditional artisans.
8. **PM Surya Ghar: Muft Bijli Yojana**: Up to ₹78,000 capital subsidy for residential rooftop solar installations.

### Madhya Pradesh State Schemes
9. **Mukhyamantri Ladli Behna Yojana (MP)**: Monthly financial assistance of ₹1,250 (₹15,000/yr) for women aged 21-60.
10. **Mukhyamantri Jan Kalyan (Sambal 2.0) Yojana (MP)**: Cradle-to-grave social security, maternity assistance (₹16,000), and death ex-gratia up to ₹4 lakh.
11. **Mukhya Mantri Kanya Vivah / Nikah Yojana (MP)**: Financial support of ₹55,000 for mass marriages of poor daughters.
12. **Mukhyamantri Medhavi Vidyarthi Yojana (MMVY) (MP)**: 100% college tuition fee reimbursement for meritorious 12th pass students.

---

## 5. Running the Application Locally

### Prerequisites
- Python 3.10+ (with pip)
- Node.js 18+ (with npm)

### Step 1: Clone and Configure Environment

```bash
cd yojanamitra-ai
cp .env.example .env
```

### Step 2: Backend Setup & Execution

```bash
cd backend
pip install -r requirements.txt

# Seed the database and index RAG vector data
python -m app.seed_data

# Run automated tests
pytest -v

# Start the FastAPI backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **Backend API**: `http://localhost:8000`
- **Swagger Interactive API Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/health`

### Step 3: Frontend Setup & Execution

```bash
cd ../frontend
npm install
npm run dev
```
- **Frontend Web Application**: `http://localhost:3000`

---

## 6. Pre-seeded Demo Credentials

For quick evaluation of protected user features (Dashboard, Saved Schemes, Document Tracking):
- **Email**: `citizen@yojanamitra.gov`
- **Password**: `Mitra@2026`

*(Alternatively, new accounts can be registered instantly with one click).*

---

## 7. Running with Docker Compose

To spin up the entire stack with PostgreSQL 16:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 8. Complete API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System and database health status |
| `POST` | `/api/auth/register` | Register new citizen profile |
| `POST` | `/api/auth/login` | JWT login token exchange |
| `GET` | `/api/auth/me` | Fetch authenticated user details |
| `POST` | `/api/auth/logout` | Session termination |
| `GET` | `/api/schemes` | Scheme discovery with search, category, state filters |
| `GET` | `/api/schemes/{id}` | Detailed scheme record with documents & rules |
| `GET` | `/api/schemes/search` | Quick auto-complete search |
| `GET` | `/api/categories` | Distinct sector list |
| `GET` | `/api/states` | Distinct state list |
| `POST` | `/api/eligibility/check` | Rule-based deterministic condition evaluation |
| `GET` | `/api/saved-schemes` | List user's bookmarked schemes |
| `POST` | `/api/saved-schemes` | Bookmark a scheme |
| `DELETE` | `/api/saved-schemes/{id}`| Remove scheme from bookmarks |
| `POST` | `/api/assistant/chat` | RAG-grounded conversational AI assistant |
| `GET` | `/api/assistant/history` | User chat history |
| `GET` | `/api/investigation/{id}`| 11-point scheme investigation report |
| `POST` | `/api/schemes/compare` | Multi-scheme comparison matrix |
| `GET` | `/api/schemes/{id}/documents` | Document checklist with collected status |
| `PUT` | `/api/schemes/{id}/documents/progress` | Update document collected state |
| `POST` | `/api/verification/check` | Misinformation, scam & claim verification |
| `GET` | `/api/profile` | Citizen profile data |
| `PUT` | `/api/profile` | Update profile information |

---

## 9. Security & Privacy Guarantees

- **No Sensitive Credential Collection**: YojanaMitra AI never collects Aadhaar numbers, OTPs, or banking PINs.
- **Cryptographic Security**: Password hashing with `bcrypt` (12 rounds) and HS256 signed JWT tokens.
- **Safe Claim Inspection**: Scam verification operates purely on text analysis; it never executes external links or downloads third-party APKs.
- **Transparent AI Operation**: If an external LLM key is absent, the system operates in verified local search-grounded mode and clearly marks citations.
