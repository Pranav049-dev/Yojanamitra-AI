def test_compare_schemes_success(client):
    schemes_res = client.get("/api/schemes?limit=2")
    items = schemes_res.json()["schemes"]
    assert len(items) >= 2
    id1 = items[0]["id"]
    id2 = items[1]["id"]

    response = client.post("/api/schemes/compare", json={"scheme_ids": [id1, id2]})
    assert response.status_code == 200
    data = response.json()
    assert len(data["schemes"]) == 2
    assert len(data["matrix"]) > 0
    assert "recommendation_summary" in data

def test_compare_schemes_validation_error(client):
    # Less than 2 schemes
    response = client.post("/api/schemes/compare", json={"scheme_ids": [1]})
    assert response.status_code == 400
