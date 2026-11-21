def test_list_schemes(client):
    response = client.get("/api/schemes")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 12
    assert len(data["schemes"]) > 0
    # Verify mandatory fields
    scheme = data["schemes"][0]
    assert "name" in scheme
    assert "slug" in scheme
    assert "benefits" in scheme
    assert "government_level" in scheme

def test_scheme_search(client):
    response = client.get("/api/schemes?q=Kisan")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any("Kisan" in s["name"] for s in data["schemes"])

def test_scheme_category_filter(client):
    response = client.get("/api/schemes?category=Healthcare")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert all(s["category"] == "Healthcare" for s in data["schemes"])

def test_scheme_state_filter(client):
    response = client.get("/api/schemes?state=Madhya Pradesh")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 4
    # All returned schemes should be MP or All India
    assert all(s["state"] in ["Madhya Pradesh", "All India"] for s in data["schemes"])

def test_get_scheme_by_id(client):
    # Fetch first scheme
    list_res = client.get("/api/schemes?limit=1")
    first_id = list_res.json()["schemes"][0]["id"]

    response = client.get(f"/api/schemes/{first_id}")
    assert response.status_code == 200
    detail = response.json()
    assert detail["id"] == first_id
    assert "required_documents" in detail
    assert "eligibility_rules" in detail
    assert "application_steps" in detail
    assert "sources" in detail

def test_get_nonexistent_scheme(client):
    response = client.get("/api/schemes/999999")
    assert response.status_code == 404

def test_get_categories_and_states(client):
    cat_res = client.get("/api/categories")
    assert cat_res.status_code == 200
    categories = cat_res.json()
    assert "Agriculture" in categories
    assert "Healthcare" in categories

    state_res = client.get("/api/states")
    assert state_res.status_code == 200
    states = state_res.json()
    assert "Madhya Pradesh" in states
    assert "All India" in states
