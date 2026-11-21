def test_get_investigation_report(client):
    schemes_res = client.get("/api/schemes?limit=1")
    scheme_id = schemes_res.json()["schemes"][0]["id"]

    response = client.get(f"/api/investigation/{scheme_id}")
    assert response.status_code == 200
    report = response.json()
    assert report["scheme_id"] == scheme_id
    assert "overview" in report
    assert "intended_beneficiaries" in report
    assert "benefits_breakdown" in report
    assert "eligibility_conditions" in report
    assert "required_documents" in report
    assert "application_process" in report
    assert "important_restrictions" in report
    assert "official_sources" in report
    assert "fraud_warnings" in report
    assert "analysis_disclaimer" in report

def test_investigation_404(client):
    response = client.get("/api/investigation/999999")
    assert response.status_code == 404
