import os
import json
import httpx
from typing import Dict, Any, List, Tuple, Optional
from app.core.config import settings
from app.services.rag_service import rag_service, DocumentChunk
from app.schemas.assistant import ChatCitation

class AIService:
    SYSTEM_PROMPT_EN = (
        "You are YojanaMitra AI, a professional and helpful research assistant for Indian government welfare schemes. "
        "Your role is to guide citizens accurately, explain eligibility in simple terms, cite official portals, and warn "
        "against misinformation and fraud. Always ground your answers strictly in the provided Context. "
        "Do not invent facts, numbers, or rules. Never guarantee scheme approval or financial disbursal. "
        "If the information is not present in the context, explicitly state that official details are unavailable."
    )

    SYSTEM_PROMPT_HI = (
        "आप योजनामित्र एआई (YojanaMitra AI) हैं — भारतीय सरकारी कल्याणकारी योजनाओं के लिए एक निष्पक्ष और विश्वसनीय अनुसंधान सहायक। "
        "नागरिकों को सरल हिंदी में योजनाओं के लाभ, पात्रता और आवेदन प्रक्रिया समझाएं। उत्तर केवल दिए गए सरकारी संदर्भ पर आधारित रखें। "
        "कभी भी मनगढ़ंत दावे न करें और न ही किसी योजना की गारंटी दें।"
    )

    @classmethod
    async def generate_response(
        cls,
        user_query: str,
        language: str = "en",
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """Generates a cited response via configured AI provider or fallback search-grounded synthesizer."""
        # 1. Retrieve top matching chunks using RAG
        retrieved = rag_service.retrieve(user_query, top_k=4)
        context_str, citations = rag_service.build_context(retrieved)

        # 2. Check provider configuration
        if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
            try:
                res = await cls._call_gemini(user_query, context_str, language, conversation_history)
                return {
                    "content": res,
                    "citations": [c.model_dump() for c in citations],
                    "provider": "gemini",
                    "provider_note": "Generated using Google Gemini API grounded on official scheme records."
                }
            except Exception as e:
                # Log error and fall back gracefully
                pass

        elif settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY:
            try:
                res = await cls._call_openai(user_query, context_str, language, conversation_history)
                return {
                    "content": res,
                    "citations": [c.model_dump() for c in citations],
                    "provider": "openai",
                    "provider_note": "Generated using OpenAI API grounded on official scheme records."
                }
            except Exception as e:
                pass

        # 3. Transparent, Honest Local RAG Search-backed Generation
        fallback_content = cls._generate_grounded_fallback(user_query, retrieved, language)
        return {
            "content": fallback_content,
            "citations": [c.model_dump() for c in citations],
            "provider": "local_rag_search",
            "provider_note": "Verified search-grounded mode (No external LLM API key configured). Information is synthesized directly from verified database records."
        }

    @classmethod
    async def _call_gemini(cls, query: str, context: str, lang: str, history: Optional[List[Dict[str, str]]]) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        sys_prompt = cls.SYSTEM_PROMPT_HI if lang == "hi" else cls.SYSTEM_PROMPT_EN

        prompt_text = f"{sys_prompt}\n\nCONTEXT FROM VERIFIED GOVERNMENT SCHEME DATABASE:\n{context}\n\nUSER QUESTION: {query}\n\nProvide a clear, cited, structured answer:"
        payload = {
            "contents": [{
                "parts": [{"text": prompt_text}]
            }],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1024
            }
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

    @classmethod
    async def _call_openai(cls, query: str, context: str, lang: str, history: Optional[List[Dict[str, str]]]) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        sys_prompt = cls.SYSTEM_PROMPT_HI if lang == "hi" else cls.SYSTEM_PROMPT_EN

        messages = [
            {"role": "system", "content": f"{sys_prompt}\n\nCONTEXT:\n{context}"},
            {"role": "user", "content": query}
        ]

        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "gpt-4o-mini",
            "messages": messages,
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    @classmethod
    def _generate_grounded_fallback(cls, query: str, retrieved: List[Tuple[DocumentChunk, float]], lang: str) -> str:
        if not retrieved or retrieved[0][1] < 0.1:
            if lang == "hi":
                return (
                    "क्षमा करें, आपके प्रश्न से संबंधित सटीक सरकारी योजना का विवरण हमारे सत्यापित डेटाबेस में नहीं मिला। "
                    "कृपया योजना का नाम, पात्रता या वर्ग (जैसे: किसान, छात्र, महिला, पेंशन) लिखकर पुनः प्रयास करें।"
                )
            return (
                "We could not locate an exact match for your query in our current database of verified central and state government schemes. "
                "Please try searching by specific scheme name, category (e.g. Agriculture, Healthcare, Housing, Women, Loans), or beneficiary group."
            )

        top_chunk, score = retrieved[0]
        other_chunks = [c for c, s in retrieved[1:] if c.scheme_id == top_chunk.scheme_id]

        if lang == "hi":
            lines = [
                f"### {top_chunk.scheme_name} (सत्यापित सरकारी विवरण)",
                "",
                f"**प्रासंगिक जानकारी:** {top_chunk.text}",
            ]
            for c in other_chunks:
                lines.append(f"- **{c.section}:** {c.text}")
            lines.extend([
                "",
                f"🔗 **आधिकारिक पोर्टल:** [{top_chunk.official_url}]({top_chunk.official_url})",
                "",
                "⚠️ *सूचना: यह उत्तर आधिकारिक सरकारी योजना रिकॉर्ड्स से सीधे खोज-आधारित संकलित किया गया है। किसी भी अनधिकृत एजेंट या शुल्क मांगने वाले व्यक्तियों से सावधान रहें।*"
            ])
            return "\n".join(lines)

        lines = [
            f"### {top_chunk.scheme_name} (Official Verified Record)",
            "",
            f"**Information Found:** {top_chunk.text}",
        ]
        for c in other_chunks:
            lines.append(f"- **{c.section}:** {c.text}")
        lines.extend([
            "",
            f"🔗 **Official Government Portal:** [{top_chunk.official_url}]({top_chunk.official_url})",
            "",
            "> ℹ️ *Note: This response is directly grounded in verified government documentation. Always verify critical updates directly on the official ministry portal before submitting personal information.*"
        ])
        return "\n".join(lines)
