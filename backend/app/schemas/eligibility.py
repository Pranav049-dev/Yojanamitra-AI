from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class UserEligibilityProfile(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    occupation: Optional[str] = None
    occupation_sector: Optional[str] = None
    family_annual_income: Optional[float] = None
    has_cultivable_land: Optional[bool] = None
    family_landholding_acres: Optional[float] = None
    is_income_tax_payer: Optional[bool] = None
    is_institutional_landholder: Optional[bool] = None
    secc_or_ration_card_eligible: Optional[bool] = None
    has_active_ayushman_card: Optional[bool] = None
    area_type: Optional[str] = None  # rural / urban
    has_pucca_house: Optional[bool] = None
    owns_motorized_vehicle: Optional[bool] = None
    has_four_wheeler: Optional[bool] = None
    business_type: Optional[str] = None
    is_defaulter: Optional[bool] = None
    beneficiary_gender: Optional[str] = None
    child_age: Optional[int] = None
    accounts_per_family: Optional[int] = None
    is_traditional_artisan: Optional[bool] = None
    has_govt_employee_in_family: Optional[bool] = None
    has_residential_electricity_connection: Optional[bool] = None
    has_suitable_roof: Optional[bool] = None
    bride_age: Optional[int] = None
    groom_age: Optional[int] = None
    is_mass_wedding_participant: Optional[bool] = None
    class_12_percentage: Optional[float] = None
    # Flexible field support
    extra_fields: Dict[str, Any] = Field(default_factory=dict)

class EligibilityCheckRequest(BaseModel):
    scheme_id: Optional[int] = None  # If provided, checks specific scheme; if None, checks all schemes
    profile: UserEligibilityProfile

class ConditionEvaluation(BaseModel):
    field: str
    label: str
    status: str  # "PASSED", "FAILED", "UNKNOWN"
    user_value: Any
    expected_rule: str
    message: str

class SchemeEligibilityResult(BaseModel):
    scheme_id: int
    scheme_name: str
    scheme_slug: str
    category: str
    status: str  # "POTENTIALLY_ELIGIBLE", "MORE_INFO_REQUIRED", "LIKELY_NOT_ELIGIBLE"
    status_label: str
    status_color: str
    summary_explanation: str
    passed_conditions: List[ConditionEvaluation]
    failed_conditions: List[ConditionEvaluation]
    unknown_conditions: List[ConditionEvaluation]
    disclaimer: str = "This assessment is rule-based research guidance, not an official government guarantee of approval."

class EligibilityCheckResponse(BaseModel):
    evaluated_at: str
    results: List[SchemeEligibilityResult]
