from app import create_app

def test_health_ok():
    app = create_app()
    app.testing = True

    client = app.test_client()
    resp = client.get("/health")

    assert resp.status_code == 200
    assert resp.get_json() == {"status": "ok"}
