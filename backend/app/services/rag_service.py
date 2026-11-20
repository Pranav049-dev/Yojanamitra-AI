import re
import math
from typing import List, Dict, Any, Tuple, Optional
from collections import Counter
from app.models.scheme import Scheme
from app.schemas.assistant import ChatCitation

class DocumentChunk:
    def __init__(self, scheme_id: int, scheme_name: str, official_url: str, section: str, text: str, source_name: str = "Government of India / State Official Portal"):
        self.scheme_id = scheme_id
        self.scheme_name = scheme_name
        self.official_url = official_url
        self.section = section
        self.text = text
        self.source_name = source_name
        self.tokens = self._tokenize(text)

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        return [w for w in cleaned.split() if len(w) > 2]

class RAGService:
    def __init__(self):
        self.chunks: List[DocumentChunk] = []
        self.doc_freqs: Dict[str, int] = Counter()
        self.num_chunks: int = 0

    def ingest_schemes(self, schemes: List[Scheme]):
        """Ingests and chunks all schemes for vector/lexical retrieval."""
        self.chunks = []
        for s in schemes:
            # Chunk 1: Overview & Beneficiaries
            self.chunks.append(DocumentChunk(
                scheme_id=s.id,
                scheme_name=s.name,
                official_url=s.official_url,
                section="Overview & Category",
                text=f"{s.name} ({s.government_level} Government - {s.state}). Category: {s.category}. Target Beneficiaries: {s.beneficiary_category}. {s.description}"
            ))

            # Chunk 2: Benefits
            self.chunks.append(DocumentChunk(
                scheme_id=s.id,
                scheme_name=s.name,
                official_url=s.official_url,
                section="Financial and Welfare Benefits",
                text=f"{s.name} Benefits: {s.benefits}"
            ))

            # Chunk 3: Eligibility Rules
            rules_text = ""
            if s.eligibility_rules and isinstance(s.eligibility_rules, dict):
                conditions = s.eligibility_rules.get("conditions", [])
                rules_text = "; ".join([c.get("label", "") + f" ({c.get('failure_message', '')})" for c in conditions])
            self.chunks.append(DocumentChunk(
                scheme_id=s.id,
                scheme_name=s.name,
                official_url=s.official_url,
                section="Eligibility Criteria",
                text=f"{s.name} Eligibility Requirements: {rules_text}"
            ))

            # Chunk 4: Required Documents
            docs_text = ""
            if s.required_documents and isinstance(s.required_documents, list):
                docs_text = ", ".join([d.get("name", "") + (": " + d.get("description", "") if d.get("description") else "") for d in s.required_documents])
            self.chunks.append(DocumentChunk(
                scheme_id=s.id,
                scheme_name=s.name,
                official_url=s.official_url,
                section="Required Documents",
                text=f"{s.name} Required Documents: {docs_text}"
            ))

            # Chunk 5: Application Process
            steps_text = ""
            if s.application_steps and isinstance(s.application_steps, list):
                steps_text = " ".join(s.application_steps)
            self.chunks.append(DocumentChunk(
                scheme_id=s.id,
                scheme_name=s.name,
                official_url=s.official_url,
                section="Application Steps",
                text=f"{s.name} How to apply: {steps_text} Official website: {s.official_url}"
            ))

        self.num_chunks = len(self.chunks)
        self.doc_freqs = Counter()
        for c in self.chunks:
            unique_words = set(c.tokens)
            for w in unique_words:
                self.doc_freqs[w] += 1

    def retrieve(self, query: str, top_k: int = 4) -> List[Tuple[DocumentChunk, float]]:
        """Retrieves top-k relevant chunks using TF-IDF and keyword boosting."""
        if not self.chunks:
            return []

        query_tokens = DocumentChunk._tokenize(query)
        if not query_tokens:
            return [(c, 0.1) for c in self.chunks[:top_k]]

        scores: List[Tuple[DocumentChunk, float]] = []

        for chunk in self.chunks:
            chunk_tokens = chunk.tokens
            chunk_len = len(chunk_tokens)
            if chunk_len == 0:
                continue

            term_counts = Counter(chunk_tokens)
            score = 0.0

            for q_term in query_tokens:
                tf = term_counts.get(q_term, 0) / chunk_len
                # IDF
                df = self.doc_freqs.get(q_term, 0)
                idf = math.log((self.num_chunks + 1) / (df + 1)) + 1.0
                score += tf * idf

                # Extra boost if term appears in scheme name or section
                if q_term in chunk.scheme_name.lower():
                    score += 0.5
                if q_term in chunk.section.lower():
                    score += 0.2

            if score > 0:
                scores.append((chunk, score))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

    def build_context(self, retrieved: List[Tuple[DocumentChunk, float]]) -> Tuple[str, List[ChatCitation]]:
        """Constructs grounded context string and citation objects."""
        context_parts = []
        citations = []
        seen_schemes = set()

        for chunk, score in retrieved:
            context_parts.append(f"[{chunk.scheme_name} - {chunk.section}]\n{chunk.text}")
            if chunk.scheme_id not in seen_schemes:
                seen_schemes.add(chunk.scheme_id)
                citations.append(ChatCitation(
                    scheme_id=chunk.scheme_id,
                    scheme_name=chunk.scheme_name,
                    official_url=chunk.official_url,
                    source_name=chunk.source_name,
                    relevance_snippet=chunk.text[:200] + "..."
                ))

        context_str = "\n\n".join(context_parts)
        return context_str, citations

rag_service = RAGService()
