import pytest

from conftest import unique_email, unique_username


@pytest.mark.asyncio
async def test_health_ok(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"


@pytest.mark.asyncio
async def test_create_user_valid(client, db_session):
    payload = {"username": unique_username("bronze_user"), "email": unique_email("bronze_user")}
    response = await client.post("/users", json=payload)
    assert response.status_code == 201
    body = response.json()
    assert isinstance(body.get("id"), int)
    assert body.get("username") == payload["username"]


@pytest.mark.asyncio
async def test_create_user_duplicate_username_conflict(client):
    username = unique_username("dup")
    first = await client.post("/users", json={"username": username, "email": unique_email("dup_a")})
    assert first.status_code == 201

    second = await client.post("/users", json={"username": username, "email": unique_email("dup_b")})
    assert second.status_code == 409


@pytest.mark.asyncio
async def test_create_user_missing_email_422(client):
    response = await client.post("/users", json={"username": unique_username("missing_email")})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_user_username_as_integer_422(client):
    response = await client.post("/users", json={"username": 123, "email": unique_email("bad_type")})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_seed_user_id_1(client):
    response = await client.get("/users/1")
    assert response.status_code == 200
    assert response.json().get("username") == "cobaltlagoon85"


@pytest.mark.asyncio
async def test_get_missing_user_404(client):
    response = await client.get("/users/99999")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_url_valid_201(client):
    user_resp = await client.post(
        "/users",
        json={"username": unique_username("url_owner"), "email": unique_email("url_owner")},
    )
    assert user_resp.status_code == 201
    user_id = user_resp.json()["id"]

    response = await client.post(
        "/urls",
        json={"user_id": user_id, "original_url": "https://example.com/valid", "title": "Valid URL"},
    )
    assert response.status_code == 201
    assert response.json().get("short_code")


@pytest.mark.asyncio
async def test_post_urls_same_url_twice_different_short_codes(client):
    user_resp = await client.post(
        "/users",
        json={"username": unique_username("twins"), "email": unique_email("twins")},
    )
    assert user_resp.status_code == 201
    user_id = user_resp.json()["id"]

    payload = {"user_id": user_id, "original_url": "https://example.com/twins-paradox"}

    first = await client.post("/urls", json=payload)
    second = await client.post("/urls", json=payload)

    assert first.status_code == 201
    assert second.status_code == 201
    assert first.json().get("short_code") != second.json().get("short_code")


@pytest.mark.asyncio
async def test_post_urls_invalid_url_422(client):
    user_resp = await client.post(
        "/users",
        json={"username": unique_username("invalidurl"), "email": unique_email("invalidurl")},
    )
    assert user_resp.status_code == 201
    user_id = user_resp.json()["id"]

    response = await client.post("/urls", json={"user_id": user_id, "original_url": "not-a-url"})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_post_urls_original_url_integer_422(client):
    user_resp = await client.post(
        "/users",
        json={"username": unique_username("badurltype"), "email": unique_email("badurltype")},
    )
    assert user_resp.status_code == 201
    user_id = user_resp.json()["id"]

    response = await client.post("/urls", json={"user_id": user_id, "original_url": 123})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_post_urls_missing_user_id_422(client):
    response = await client.post("/urls", json={"original_url": "https://example.com/missing-user"})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_short_code_active_302(client):
    user_resp = await client.post(
        "/users",
        json={"username": unique_username("active_redirect"), "email": unique_email("active_redirect")},
    )
    assert user_resp.status_code == 201
    user_id = user_resp.json()["id"]

    url_resp = await client.post("/urls", json={"user_id": user_id, "original_url": "https://example.com/active"})
    assert url_resp.status_code == 201
    short_code = url_resp.json()["short_code"]

    response = await client.get(f"/{short_code}")
    assert response.status_code == 302


@pytest.mark.asyncio
async def test_get_nonexistent_short_code_404(client):
    response = await client.get("/nonexistent")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_url_by_id_200(client):
    user_resp = await client.post(
        "/users",
        json={"username": unique_username("get_url"), "email": unique_email("get_url")},
    )
    assert user_resp.status_code == 201
    user_id = user_resp.json()["id"]

    url_resp = await client.post("/urls", json={"user_id": user_id, "original_url": "https://example.com/get-url-id"})
    assert url_resp.status_code == 201
    url_id = url_resp.json()["id"]

    fetched = await client.get(f"/urls/{url_id}")
    assert fetched.status_code == 200


@pytest.mark.asyncio
async def test_delete_url_deactivates_and_blocks_redirect(client):
    user_resp = await client.post(
        "/users",
        json={"username": unique_username("slumber"), "email": unique_email("slumber")},
    )
    assert user_resp.status_code == 201
    user_id = user_resp.json()["id"]

    url_resp = await client.post("/urls", json={"user_id": user_id, "original_url": "https://example.com/slumber"})
    assert url_resp.status_code == 201
    short_code = url_resp.json()["short_code"]
    url_id = url_resp.json()["id"]

    delete_resp = await client.delete(f"/urls/{url_id}")
    assert delete_resp.status_code == 200

    redirect_resp = await client.get(f"/{short_code}")
    assert redirect_resp.status_code == 404


@pytest.mark.asyncio
async def test_no_url_visited_event_after_deactivate(client):
    user_resp = await client.post(
        "/users",
        json={"username": unique_username("event_guard"), "email": unique_email("event_guard")},
    )
    assert user_resp.status_code == 201
    user_id = user_resp.json()["id"]

    url_resp = await client.post("/urls", json={"user_id": user_id, "original_url": "https://example.com/no-visit"})
    assert url_resp.status_code == 201
    url_id = url_resp.json()["id"]
    short_code = url_resp.json()["short_code"]

    await client.delete(f"/urls/{url_id}")
    await client.get(f"/{short_code}")

    events_resp = await client.get("/events")
    assert events_resp.status_code == 200
    events = events_resp.json()

    visited_for_url = [
        event for event in events if event.get("url_id") == url_id and event.get("event_type") == "url_visited"
    ]
    assert visited_for_url == []


@pytest.mark.asyncio
async def test_get_events_list_200(client):
    response = await client.get("/events")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_get_events_filter_user_id_200(client):
    response = await client.get("/events", params={"user_id": 1})
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_get_events_filter_url_id_200(client):
    response = await client.get("/events", params={"url_id": 1})
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_post_urls_creates_url_created_event(client):
    user_resp = await client.post(
        "/users",
        json={"username": unique_username("create_event"), "email": unique_email("create_event")},
    )
    assert user_resp.status_code == 201
    user_id = user_resp.json()["id"]

    url_resp = await client.post("/urls", json={"user_id": user_id, "original_url": "https://example.com/event-create"})
    assert url_resp.status_code == 201
    url_id = url_resp.json()["id"]

    events_resp = await client.get("/events")
    assert events_resp.status_code == 200
    events = events_resp.json()
    assert any(e.get("url_id") == url_id and e.get("event_type") == "url_created" for e in events)


@pytest.mark.asyncio
async def test_redirect_creates_url_visited_event(client):
    user_resp = await client.post(
        "/users",
        json={"username": unique_username("visit_event"), "email": unique_email("visit_event")},
    )
    assert user_resp.status_code == 201
    user_id = user_resp.json()["id"]

    url_resp = await client.post("/urls", json={"user_id": user_id, "original_url": "https://example.com/event-visit"})
    assert url_resp.status_code == 201
    short_code = url_resp.json()["short_code"]
    url_id = url_resp.json()["id"]

    redirect_resp = await client.get(f"/{short_code}")
    assert redirect_resp.status_code == 302

    events_resp = await client.get("/events")
    events = events_resp.json()
    assert any(e.get("url_id") == url_id and e.get("event_type") == "url_visited" for e in events)


@pytest.mark.asyncio
async def test_post_users_creates_user_created_event(client):
    username = unique_username("user_event")
    user_resp = await client.post("/users", json={"username": username, "email": unique_email("user_event")})
    assert user_resp.status_code == 201
    user_id = user_resp.json()["id"]

    events_resp = await client.get("/events")
    events = events_resp.json()
    assert any(e.get("user_id") == user_id and e.get("event_type") == "user_created" for e in events)


@pytest.mark.asyncio
async def test_post_users_empty_body_422(client):
    response = await client.post("/users", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_post_urls_empty_body_422(client):
    response = await client.post("/urls", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_users_non_integer_id_422(client):
    response = await client.get("/users/abc")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_post_users_extra_fields_ignored_201(client):
    payload = {
        "username": unique_username("extra_fields"),
        "email": unique_email("extra_fields"),
        "role": "ignored",
        "metadata": {"x": 1},
    }
    response = await client.post("/users", json=payload)
    assert response.status_code == 201
    body = response.json()
    assert body.get("username") == payload["username"]
    assert "role" not in body
