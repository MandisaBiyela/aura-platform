"""API integration tests using TestClient (auth, devices, tickets)."""

from __future__ import annotations

import uuid

from fastapi.testclient import TestClient


def _unique_email(prefix: str = "user") -> str:
    return f"{prefix}.{uuid.uuid4().hex[:12]}@example.com"


def test_register_user(client: TestClient) -> None:
    email = _unique_email("register")
    password = "securepass1"
    r = client.post(
        "/auth/register",
        json={"email": email, "password": password},
    )
    assert r.status_code == 201
    body = r.json()
    assert body["email"] == email
    assert "id" in body
    assert "created_at" in body


def test_login_returns_token(client: TestClient) -> None:
    email = _unique_email("login")
    password = "anotherpass1"
    reg = client.post("/auth/register", json={"email": email, "password": password})
    assert reg.status_code == 201

    r = client.post("/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200
    data = r.json()
    assert data["token_type"] == "bearer"
    assert isinstance(data["access_token"], str)
    assert len(data["access_token"]) > 20


def test_create_device_requires_authentication(client: TestClient) -> None:
    r = client.post(
        "/devices",
        json={
            "name": "Router A",
            "serial_number": "SN-001",
            "status": "online",
            "location": "Lab 1",
        },
    )
    assert r.status_code == 401


def test_create_device_authenticated(client: TestClient) -> None:
    email = _unique_email("device_owner")
    password = "deviceowner1"
    client.post("/auth/register", json={"email": email, "password": password})
    login = client.post("/auth/login", json={"email": email, "password": password})
    token = login.json()["access_token"]

    r = client.post(
        "/devices",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Switch Core",
            "serial_number": f"SN-{uuid.uuid4().hex[:8]}",
            "status": "online",
            "location": "DC-1",
        },
    )
    assert r.status_code == 201
    d = r.json()
    assert d["name"] == "Switch Core"
    assert d["is_active"] is True
    assert "id" in d


def test_list_devices(client: TestClient) -> None:
    email = _unique_email("lister")
    password = "listerpass1"
    client.post("/auth/register", json={"email": email, "password": password})
    token = client.post("/auth/login", json={"email": email, "password": password}).json()[
        "access_token"
    ]
    headers = {"Authorization": f"Bearer {token}"}
    sn = f"LIST-{uuid.uuid4().hex[:8]}"
    create = client.post(
        "/devices",
        headers=headers,
        json={
            "name": "Listed Device",
            "serial_number": sn,
            "status": "offline",
            "location": "Store",
        },
    )
    assert create.status_code == 201
    created_id = create.json()["id"]

    r = client.get("/devices", headers=headers)
    assert r.status_code == 200
    devices = r.json()
    assert isinstance(devices, list)
    assert any(d["id"] == created_id and d["serial_number"] == sn for d in devices)


def test_create_ticket_linked_to_device(client: TestClient) -> None:
    email = _unique_email("ticket_creator")
    password = "ticketcreator1"
    client.post("/auth/register", json={"email": email, "password": password})
    token = client.post("/auth/login", json={"email": email, "password": password}).json()[
        "access_token"
    ]
    headers = {"Authorization": f"Bearer {token}"}
    dev = client.post(
        "/devices",
        headers=headers,
        json={
            "name": "Host for ticket",
            "serial_number": f"TKT-{uuid.uuid4().hex[:8]}",
            "status": "online",
            "location": "Rack 3",
        },
    )
    assert dev.status_code == 201
    device_id = dev.json()["id"]

    r = client.post(
        "/tickets",
        headers=headers,
        json={
            "device_id": device_id,
            "title": "Disk warning",
            "description": "SMART errors reported",
            "priority": "high",
            "status": "open",
        },
    )
    assert r.status_code == 201
    t = r.json()
    assert t["device_id"] == device_id
    assert t["title"] == "Disk warning"
    assert t["status"] == "open"
    assert t["priority"] == "high"


def test_update_ticket_status(client: TestClient) -> None:
    email = _unique_email("status_user")
    password = "statususerpass1"
    client.post("/auth/register", json={"email": email, "password": password})
    token = client.post("/auth/login", json={"email": email, "password": password}).json()[
        "access_token"
    ]
    headers = {"Authorization": f"Bearer {token}"}
    device_id = client.post(
        "/devices",
        headers=headers,
        json={
            "name": "Ticket host",
            "serial_number": f"ST-{uuid.uuid4().hex[:8]}",
            "status": "online",
            "location": "HQ",
        },
    ).json()["id"]

    ticket_id = client.post(
        "/tickets",
        headers=headers,
        json={
            "device_id": device_id,
            "title": "Network flap",
            "description": None,
            "priority": "medium",
            "status": "open",
        },
    ).json()["id"]

    r = client.patch(
        f"/tickets/{ticket_id}/status",
        headers=headers,
        json={"status": "in_progress"},
    )
    assert r.status_code == 200
    assert r.json()["status"] == "in_progress"

    r2 = client.patch(
        f"/tickets/{ticket_id}/status",
        headers=headers,
        json={"status": "resolved"},
    )
    assert r2.status_code == 200
    assert r2.json()["status"] == "resolved"


def test_classify_ticket_text(client: TestClient) -> None:
    from unittest.mock import AsyncMock, patch

    email = _unique_email("classify_user")
    password = "classifypass1"
    client.post("/auth/register", json={"email": email, "password": password})
    token = client.post("/auth/login", json={"email": email, "password": password}).json()[
        "access_token"
    ]
    headers = {"Authorization": f"Bearer {token}"}

    mock_result = {
        "category": "hardware",
        "confidence": 0.92,
        "all_scores": {"hardware": 0.92, "software": 0.08},
    }
    with patch(
        "backend.tickets.routes.fetch_classification",
        new=AsyncMock(return_value=mock_result),
    ):
        r = client.post(
            "/tickets/classify",
            headers=headers,
            json={"text": "Disk failure on RAID array"},
        )
    assert r.status_code == 200
    body = r.json()
    assert body["category"] == "hardware"
    assert body["confidence"] == 0.92
    assert body["all_scores"]["hardware"] == 0.92
