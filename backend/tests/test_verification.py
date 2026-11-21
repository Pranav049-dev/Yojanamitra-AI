def test_verify_scam_message_with_otp_and_fee(client):
    scam_text = "Congratulations! You have been selected for free government housing loan under PM scheme. Pay processing fee Rs. 500 and send OTP to this number."
    response = client.post("/api/verification/check", json={"text": scam_text})
    assert response.status_code == 200
    data = response.json()
    assert data["overall_status"] == "SUSPECTED_SCAM"
    assert len(data["security_warnings"]) >= 1
    assert any("OTP" in w or "fee" in w.lower() for w in data["security_warnings"])

def test_verify_authentic_scheme_fact(client):
    genuine_text = "Under PM-KISAN scheme, eligible farmer families receive 6,000 per year directly in bank accounts in three installments."
    response = client.post("/api/verification/check", json={"text": genuine_text})
    assert response.status_code == 200
    data = response.json()
    assert data["overall_status"] in ["VERIFIED_GENUINE", "INCONCLUSIVE"]
    assert any(b["verdict"] == "SUPPORTED" for b in data["claim_breakdown"])

def test_verify_conflicting_amounts(client):
    conflicting_text = "Under PM-KISAN, the central government gives 50,000 cash every month to all farmers."
    response = client.post("/api/verification/check", json={"text": conflicting_text})
    assert response.status_code == 200
    data = response.json()
    assert any(b["verdict"] in ["CONFLICTING", "UNVERIFIABLE"] for b in data["claim_breakdown"])

def test_verify_short_text_validation_error(client):
    response = client.post("/api/verification/check", json={"text": "hi"})
    assert response.status_code == 422
