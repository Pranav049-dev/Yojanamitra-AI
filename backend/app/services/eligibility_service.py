from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.models.scheme import Scheme
from app.schemas.eligibility import (
    UserEligibilityProfile,
    ConditionEvaluation,
    SchemeEligibilityResult,
    EligibilityCheckResponse
)

class EligibilityEngine:
    OPERATOR_FORMATTERS = {
        "equals": lambda val: f"Must be {val}",
        "not_equals": lambda val: f"Must not be {val}",
        "greater_than": lambda val: f"Must be greater than {val}",
        "greater_than_or_equal": lambda val: f"Must be at least {val}",
        "less_than": lambda val: f"Must be less than {val}",
        "less_than_or_equal": lambda val: f"Must not exceed {val}",
        "in": lambda val: f"Must be one of: {', '.join(map(str, val))}",
        "boolean": lambda val: "Required condition" if val else "Must not apply"
    }

    @staticmethod
    def evaluate_condition(condition: Dict[str, Any], profile_dict: Dict[str, Any]) -> ConditionEvaluation:
        field = condition.get("field")
        operator = condition.get("operator", "equals")
        target_value = condition.get("value")
        label = condition.get("label", field)
        failure_msg = condition.get("failure_message", f"Criteria for {label} not satisfied.")

        # Check if field exists in user profile
        user_val = profile_dict.get(field)
        if user_val is None and "extra_fields" in profile_dict:
            user_val = profile_dict["extra_fields"].get(field)

        formatter = EligibilityEngine.OPERATOR_FORMATTERS.get(operator, lambda v: f"{operator} {v}")
        expected_rule_str = formatter(target_value)

        # Handle unknown / missing input (DO NOT FAIL MISSING DATA)
        if user_val is None:
            return ConditionEvaluation(
                field=field,
                label=label,
                status="UNKNOWN",
                user_value="Not provided",
                expected_rule=expected_rule_str,
                message=f"Please provide '{label}' to confirm this condition."
            )

        # Type conversion & normalization
        passed = False
        try:
            if operator == "equals":
                if isinstance(target_value, str) and isinstance(user_val, str):
                    passed = target_value.strip().lower() == user_val.strip().lower()
                else:
                    passed = target_value == user_val
            elif operator == "not_equals":
                if isinstance(target_value, str) and isinstance(user_val, str):
                    passed = target_value.strip().lower() != user_val.strip().lower()
                else:
                    passed = target_value != user_val
            elif operator == "greater_than":
                passed = float(user_val) > float(target_value)
            elif operator == "greater_than_or_equal":
                passed = float(user_val) >= float(target_value)
            elif operator == "less_than":
                passed = float(user_val) < float(target_value)
            elif operator == "less_than_or_equal":
                passed = float(user_val) <= float(target_value)
            elif operator == "in":
                if isinstance(target_value, list):
                    norm_targets = [str(x).strip().lower() for x in target_value]
                    passed = str(user_val).strip().lower() in norm_targets
                else:
                    passed = user_val in target_value
            elif operator == "boolean":
                passed = bool(user_val) == bool(target_value)
            else:
                passed = str(user_val) == str(target_value)
        except (ValueError, TypeError):
            passed = False

        if passed:
            return ConditionEvaluation(
                field=field,
                label=label,
                status="PASSED",
                user_value=str(user_val),
                expected_rule=expected_rule_str,
                message=f"Satisfied ({user_val})."
            )
        else:
            return ConditionEvaluation(
                field=field,
                label=label,
                status="FAILED",
                user_value=str(user_val),
                expected_rule=expected_rule_str,
                message=failure_msg
            )

    @staticmethod
    def evaluate_scheme(scheme: Scheme, profile: UserEligibilityProfile) -> SchemeEligibilityResult:
        profile_dict = profile.model_dump()
        rules_data = scheme.eligibility_rules or {}
        conditions = rules_data.get("conditions", [])

        passed_list: List[ConditionEvaluation] = []
        failed_list: List[ConditionEvaluation] = []
        unknown_list: List[ConditionEvaluation] = []

        for cond in conditions:
            evaluation = EligibilityEngine.evaluate_condition(cond, profile_dict)
            if evaluation.status == "PASSED":
                passed_list.append(evaluation)
            elif evaluation.status == "FAILED":
                failed_list.append(evaluation)
            else:
                unknown_list.append(evaluation)

        # Classification Logic
        if len(failed_list) > 0:
            status = "LIKELY_NOT_ELIGIBLE"
            status_label = "Likely Not Eligible"
            status_color = "red"
            summary = f"You appear to miss {len(failed_list)} required criteria for this scheme: {failed_list[0].message}"
        elif len(unknown_list) > 0:
            status = "MORE_INFO_REQUIRED"
            status_label = "More Information Required"
            status_color = "yellow"
            missing_names = ", ".join([u.label for u in unknown_list[:2]])
            summary = f"You meet {len(passed_list)} criteria, but {len(unknown_list)} condition(s) require more details ({missing_names})."
        else:
            status = "POTENTIALLY_ELIGIBLE"
            status_label = "Potentially Eligible"
            status_color = "green"
            summary = f"Great news! You meet all {len(passed_list)} evaluated eligibility conditions based on the information provided."

        return SchemeEligibilityResult(
            scheme_id=scheme.id,
            scheme_name=scheme.name,
            scheme_slug=scheme.slug,
            category=scheme.category,
            status=status,
            status_label=status_label,
            status_color=status_color,
            summary_explanation=summary,
            passed_conditions=passed_list,
            failed_conditions=failed_list,
            unknown_conditions=unknown_list
        )

    @staticmethod
    def check_eligibility(schemes: List[Scheme], profile: UserEligibilityProfile) -> EligibilityCheckResponse:
        results = []
        for scheme in schemes:
            res = EligibilityEngine.evaluate_scheme(scheme, profile)
            results.append(res)

        # Sort: Potentially eligible first, then More Info, then Likely Not Eligible
        sort_order = {"POTENTIALLY_ELIGIBLE": 0, "MORE_INFO_REQUIRED": 1, "LIKELY_NOT_ELIGIBLE": 2}
        results.sort(key=lambda r: sort_order.get(r.status, 3))

        return EligibilityCheckResponse(
            evaluated_at=datetime.now(timezone.utc).isoformat(),
            results=results
        )
