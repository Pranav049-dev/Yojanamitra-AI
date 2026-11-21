def test_eligibility_check_pm_kisan_eligible(client):
    # Find PM-KISAN ID
    schemes_res = client.get("/api/schemes?q=PM-KISAN")
    pm_kisan_id = schemes_res.json()["schemes"][0]["id"]

    payload = {
        "scheme_id": pm_kisan_id,
        "profile": {
            "occupation": "farmer",
            "has_cultivable_land": True,
            "is_income_tax_payer": False,
            "is_institutional_landholder": False
        }
    }
    response = client.post("/api/eligibility/check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 1
    res = data["results"][0]
    assert res["status"] == "POTENTIALLY_ELIGIBLE"
    assert len(res["passed_conditions"]) >= 4
    assert len(res["failed_conditions"]) == 0
    assert "disclaimer" in res

def test_eligibility_check_fails_on_income_tax(client):
    schemes_res = client.get("/api/schemes?q=PM-KISAN")
    pm_kisan_id = schemes_res.json()["schemes"][0]["id"]

    payload = {
        "scheme_id": pm_kisan_id,
        "profile": {
            "occupation": "farmer",
            "has_cultivable_land": True,
            "is_income_tax_payer": True,  # Disqualifier
            "is_institutional_landholder": False
        }
    }
    response = client.post("/api/eligibility/check", json=payload)
    assert response.status_code == 200
    res = response.json()["results"][0]
    assert res["status"] == "LIKELY_NOT_ELIGIBLE"
    assert len(res["failed_conditions"]) >= 1

def test_eligibility_check_missing_info_not_failed(client):
    schemes_res = client.get("/api/schemes?q=PM-KISAN")
    pm_kisan_id = schemes_res.json()["schemes"][0]["id"]

    payload = {
        "scheme_id": pm_kisan_id,
        "profile": {
            "occupation": "farmer"
            # Missing cultivable land, tax status, etc.
        }
    }
    response = client.post("/api/eligibility/check", json=payload)
    assert response.status_code == 200
    res = response.json()["results"][0]
    # Prompt rule: "Do not assume that missing user information means a failed condition."
    assert res["status"] == "MORE_INFO_REQUIRED"
    assert len(res["unknown_conditions"]) >= 1

def test_eligibility_all_schemes_batch(client):
    payload = {
        "profile": {
            "age": 28,
            "gender": "female",
            "state": "Madhya Pradesh",
            "family_annual_income": 150000,
            "family_landholding_acres": 2.0,
            "has_four_wheeler": False
        }
    }
    response = client.post("/api/eligibility/check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) >= 12
