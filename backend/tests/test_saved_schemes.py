def test_saved_schemes_lifecycle(client, auth_headers):
    # Fetch a scheme ID
    schemes_res = client.get("/api/schemes?limit=1")
    scheme_id = schemes_res.json()["schemes"][0]["id"]

    # 1. Save scheme
    save_res = client.post("/api/saved-schemes", json={"scheme_id": scheme_id}, headers=auth_headers)
    assert save_res.status_code == 201

    # 2. Get saved schemes
    list_res = client.get("/api/saved-schemes", headers=auth_headers)
    assert list_res.status_code == 200
    saved_list = list_res.json()
    assert any(s["id"] == scheme_id for s in saved_list)

    # 3. Delete saved scheme
    del_res = client.delete(f"/api/saved-schemes/{scheme_id}", headers=auth_headers)
    assert del_res.status_code == 200

    # 4. Verify removed
    list_after = client.get("/api/saved-schemes", headers=auth_headers)
    assert not any(s["id"] == scheme_id for s in list_after.json())

def test_saved_schemes_unauthorized(client):
    response = client.get("/api/saved-schemes")
    assert response.status_code == 401
