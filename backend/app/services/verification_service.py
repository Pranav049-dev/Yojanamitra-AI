import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.scheme import Scheme
from app.schemas.verification import ClaimVerificationResponse, ClaimItemVerdict

class MisinformationVerificationService:
    # High-risk scam indicators
    SUSPICIOUS_PATTERNS = [
        (r"\b(otp|one[- ]time[- ]password)\b", "CRITICAL: Message mentions OTP. Legitimate government schemes NEVER ask citizens to share OTP over messages or phone calls."),
        (r"\b(fee|charge|processing fee|rs\.?\s*\d+|deposit)\b.*(advance|pay|transfer)", "CRITICAL: Requests advance payment or processing fees. Genuine government welfare registrations are free."),
        (r"\b(click here|bit\.ly|tinyurl|\.xyz|\.top|\.online|apk|download link)\b", "SUSPICIOUS: Contains unverified external or short link. Official government websites strictly use .gov.in or .nic.in domains."),
        (r"\b(pin|password|cvv|debit card|credit card)\b", "HIGH RISK: Requests confidential banking credentials. Government schemes disburse via DBT and never request debit card CVV or PIN numbers."),
        (r"\b(bonus|jackpot|urgent|limited time offer|guaranteed lottery)\b", "RED FLAG: Uses urgency or lottery claims. Government benefits are based on legal criteria, not lotteries or urgent flash offers.")
    ]

    @classmethod
    def verify_claim(cls, db: Session, text: str) -> ClaimVerificationResponse:
        cleaned_text = text.strip()
        warnings = []
        is_scam_suspected = False

        # 1. Screen for security threats and fraud markers
        for pattern, warning in cls.SUSPICIOUS_PATTERNS:
            if re.search(pattern, cleaned_text, re.IGNORECASE):
                warnings.append(warning)
                is_scam_suspected = True

        # 2. Extract key claim sentences
        raw_sentences = [s.strip() for s in re.split(r"[\n.!?]+", cleaned_text) if len(s.strip()) > 10]
        if not raw_sentences:
            raw_sentences = [cleaned_text]

        # 3. Retrieve all verified schemes for fact matching
        all_schemes = db.query(Scheme).all()
        breakdown: List[ClaimItemVerdict] = []

        for sentence in raw_sentences[:5]:  # Analyze up to 5 main claims
            best_match: Scheme = None
            max_keyword_matches = 0

            # Match against schemes
            words = set(re.findall(r"\w+", sentence.lower()))
            for s in all_schemes:
                scheme_words = set(re.findall(r"\w+", f"{s.name} {s.category} {s.state} {s.benefits}".lower()))
                overlap = len(words.intersection(scheme_words))
                if overlap > max_keyword_matches:
                    max_keyword_matches = overlap
                    best_match = s

            if is_scam_suspected and any(k in sentence.lower() for k in ["fee", "charge", "pay", "otp", "link"]):
                breakdown.append(ClaimItemVerdict(
                    claim_extracted=sentence,
                    verdict="FRAUD_ALERT",
                    verdict_label="High Risk / Fraud Pattern",
                    confidence=0.95,
                    analysis="This claim exhibits known fraudulent mechanisms (e.g. asking for advance fee, OTP sharing, or untrusted links). Legitimate government schemes never operate this way.",
                    matched_scheme=best_match.name if best_match else None,
                    official_source_url=best_match.official_url if best_match else "https://www.india.gov.in",
                    official_source_name="National Official Portal of India"
                ))
            elif best_match and max_keyword_matches >= 3:
                # Compare facts with matched scheme
                # Check if financial numbers in sentence match scheme benefits
                numbers_in_sentence = re.findall(r"\d+[\d,]*", sentence)
                numbers_in_benefits = re.findall(r"\d+[\d,]*", best_match.benefits)

                matches_number = any(n.replace(",", "") in [b.replace(",", "") for b in numbers_in_benefits] for n in numbers_in_sentence)

                if matches_number or not numbers_in_sentence:
                    breakdown.append(ClaimItemVerdict(
                        claim_extracted=sentence,
                        verdict="SUPPORTED",
                        verdict_label="Supported by Official Records",
                        confidence=0.88,
                        analysis=f"Matches verified details for '{best_match.name}'. Verified benefits: {best_match.benefits[:150]}...",
                        matched_scheme=best_match.name,
                        official_source_url=best_match.official_url,
                        official_source_name=f"{best_match.name} Official Portal"
                    ))
                else:
                    breakdown.append(ClaimItemVerdict(
                        claim_extracted=sentence,
                        verdict="CONFLICTING",
                        verdict_label="Conflicting with Official Records",
                        confidence=0.82,
                        analysis=f"The amounts or stipulations in your statement conflict with official records for '{best_match.name}'. Official benefits: {best_match.benefits[:150]}...",
                        matched_scheme=best_match.name,
                        official_source_url=best_match.official_url,
                        official_source_name=f"{best_match.name} Official Portal"
                    ))
            else:
                breakdown.append(ClaimItemVerdict(
                    claim_extracted=sentence,
                    verdict="UNVERIFIABLE",
                    verdict_label="Unverifiable against Verified Schemes",
                    confidence=0.50,
                    analysis="No exact matching central or state government scheme record was found in the verified database. This may be an unofficial rumor or an unsupported scheme claim.",
                    matched_scheme=None,
                    official_source_url="https://www.myscheme.gov.in",
                    official_source_name="myScheme National Portal"
                ))

        # 4. Overall status determination
        has_fraud = any(b.verdict == "FRAUD_ALERT" for b in breakdown)
        has_conflict = any(b.verdict == "CONFLICTING" for b in breakdown)
        has_supported = any(b.verdict == "SUPPORTED" for b in breakdown)

        if has_fraud:
            status = "SUSPECTED_SCAM"
            summary = "CAUTION: This submission contains hallmarks of deceptive or fraudulent scheme misrepresentations. Do not make any payments or share sensitive OTPs."
        elif has_conflict:
            status = "MISLEADING_OR_FALSE"
            summary = "MISLEADING: Portions of this message contradict official government records and guidelines."
        elif has_supported and not has_conflict:
            status = "VERIFIED_GENUINE"
            summary = "AUTHENTIC: The claims align with verified government documentation and official portal guidelines."
        else:
            status = "INCONCLUSIVE"
            summary = "INCONCLUSIVE: Could not conclusively verify against currently recorded schemes. Verify directly on official .gov.in portals."

        guidance = (
            "Always verify scheme updates on official government websites (.gov.in or .nic.in). "
            "Never download unverified APK files or forward WhatsApp messages promising free money without official verification."
        )

        return ClaimVerificationResponse(
            submitted_text=text,
            overall_status=status,
            overall_summary=summary,
            security_warnings=warnings,
            claim_breakdown=breakdown,
            official_guidance=guidance
        )
