from pydantic import BaseModel
from typing import List, Dict, Any

class SchemeCompareRequest(BaseModel):
    scheme_ids: List[int]

class SchemeComparisonFeature(BaseModel):
    feature_name: str
    feature_key: str
    values: Dict[int, Any]  # scheme_id -> value string/list

class SchemeCompareResponse(BaseModel):
    schemes: List[Dict[str, Any]]
    matrix: List[SchemeComparisonFeature]
    key_differences: List[str]
    recommendation_summary: str
