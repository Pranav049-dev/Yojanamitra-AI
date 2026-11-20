from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc
from app.models.scheme import Scheme, SchemeSource

class SchemeService:
    @staticmethod
    def get_schemes(
        db: Session,
        query: Optional[str] = None,
        category: Optional[str] = None,
        state: Optional[str] = None,
        government_level: Optional[str] = None,
        beneficiary_category: Optional[str] = None,
        sort_by: str = "name_asc",
        page: int = 1,
        limit: int = 12
    ) -> Dict[str, Any]:
        q = db.query(Scheme)

        if query:
            search = f"%{query.strip()}%"
            q = q.filter(
                or_(
                    Scheme.name.ilike(search),
                    Scheme.description.ilike(search),
                    Scheme.benefits.ilike(search),
                    Scheme.category.ilike(search),
                    Scheme.beneficiary_category.ilike(search)
                )
            )

        if category and category != "All":
            q = q.filter(Scheme.category == category)

        if state and state != "All":
            q = q.filter(or_(Scheme.state == state, Scheme.state == "All India"))

        if government_level and government_level != "All":
            q = q.filter(Scheme.government_level == government_level)

        if beneficiary_category and beneficiary_category != "All":
            q = q.filter(Scheme.beneficiary_category == beneficiary_category)

        # Sorting
        if sort_by == "name_desc":
            q = q.order_by(desc(Scheme.name))
        elif sort_by == "newest":
            q = q.order_by(desc(Scheme.created_at))
        elif sort_by == "verified":
            q = q.order_by(desc(Scheme.last_verified_at))
        else:
            q = q.order_by(asc(Scheme.name))

        total = q.count()
        offset = (page - 1) * limit
        schemes = q.offset(offset).limit(limit).all()

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "schemes": schemes
        }

    @staticmethod
    def get_scheme_by_id(db: Session, scheme_id: int) -> Optional[Scheme]:
        return db.query(Scheme).filter(Scheme.id == scheme_id).first()

    @staticmethod
    def get_scheme_by_slug(db: Session, slug: str) -> Optional[Scheme]:
        return db.query(Scheme).filter(Scheme.slug == slug).first()

    @staticmethod
    def get_categories(db: Session) -> List[str]:
        results = db.query(Scheme.category).distinct().all()
        return sorted([r[0] for r in results if r[0]])

    @staticmethod
    def get_states(db: Session) -> List[str]:
        results = db.query(Scheme.state).distinct().all()
        return sorted([r[0] for r in results if r[0]])

    @staticmethod
    def get_filter_options(db: Session) -> Dict[str, List[str]]:
        categories = SchemeService.get_categories(db)
        states = SchemeService.get_states(db)
        gov_levels = [r[0] for r in db.query(Scheme.government_level).distinct().all() if r[0]]
        beneficiaries = [r[0] for r in db.query(Scheme.beneficiary_category).distinct().all() if r[0]]
        return {
            "categories": categories,
            "states": states,
            "government_levels": sorted(gov_levels),
            "beneficiary_categories": sorted(beneficiaries)
        }

    @staticmethod
    def compare_schemes(db: Session, scheme_ids: List[int]) -> Dict[str, Any]:
        schemes = db.query(Scheme).filter(Scheme.id.in_(scheme_ids)).all()
        if not schemes:
            return {"schemes": [], "matrix": [], "key_differences": [], "recommendation_summary": "No schemes found to compare."}

        features = [
            {"key": "government_level", "name": "Government Level"},
            {"key": "state", "name": "Jurisdiction / State"},
            {"key": "category", "name": "Sector / Category"},
            {"key": "beneficiary_category", "name": "Target Beneficiary"},
            {"key": "benefits", "name": "Primary Financial / Welfare Benefits"},
            {"key": "official_url", "name": "Official Government Portal"},
            {"key": "verification_status", "name": "Verification Status"}
        ]

        matrix = []
        for feat in features:
            values = {}
            for s in schemes:
                val = getattr(s, feat["key"], "N/A")
                values[s.id] = val
            matrix.append({
                "feature_name": feat["name"],
                "feature_key": feat["key"],
                "values": values
            })

        key_diffs = []
        if len(schemes) > 1:
            levels = {s.government_level for s in schemes}
            if len(levels) > 1:
                key_diffs.append(f"Schemes span different tiers: {', '.join(levels)}.")
            categories = {s.category for s in schemes}
            if len(categories) > 1:
                key_diffs.append(f"Focus sectors differ: {', '.join(categories)}.")
            states = {s.state for s in schemes}
            if len(states) > 1:
                key_diffs.append(f"Geographic scope varies across {', '.join(states)}.")

        summary = f"Comparing {len(schemes)} schemes across central and state welfare provisions. Review eligibility criteria and required documents before applying."

        schemes_data = [
            {
                "id": s.id,
                "name": s.name,
                "slug": s.slug,
                "category": s.category,
                "government_level": s.government_level,
                "state": s.state,
                "benefits": s.benefits,
                "official_url": s.official_url
            }
            for s in schemes
        ]

        return {
            "schemes": schemes_data,
            "matrix": matrix,
            "key_differences": key_diffs,
            "recommendation_summary": summary
        }
