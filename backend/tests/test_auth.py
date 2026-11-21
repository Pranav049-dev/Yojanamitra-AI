def test_register_user_success(client):
    payload = {
        "name": "Pooja Verma",
        "email": "pooja.verma@example.org",
        "password": "SecurePassword123!",
        "preferred_language": "hi",
        "state": "Madhya Pradesh",
        "occupation": "student",
        "annual_income": 120000.0
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "pooja.verma@example.org"
    assert data["user"]["name"] == "Pooja Verma"

def test_register_duplicate_email(client):
    payload = {
        "name": "Duplicate User",
        "email": "citizen@yojanamitra.gov",  # Already seeded
        "password": "Password123!"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()

def test_register_invalid_password(client):
    payload = {
        "name": "Short Password",
        "email": "short@example.com",
        "password": "123"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 422

def test_login_success(client):
    response = client.post("/api/auth/login", json={
        "email": "citizen@yojanamitra.gov",
        "password": "Mitra@2026"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "citizen@yojanamitra.gov"

def test_login_invalid_password(client):
    response = client.post("/api/auth/login", json={
        "email": "citizen@yojanamitra.gov",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401

def test_auth_me_protected(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "citizen@yojanamitra.gov"

def test_auth_me_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
