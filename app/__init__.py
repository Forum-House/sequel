import urllib.request
import urllib.error
from flask import Flask, request, Response

def create_app():
    flask_app = Flask(__name__)

    FASTAPI_BASE = "http://localhost:8000"

    @flask_app.route("/health")
    def health():
        return {"status": "ok"}, 200

    @flask_app.route("/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
    def proxy(path):
        url = f"{FASTAPI_BASE}/{path}"
        if request.query_string:
            url = f"{url}?{request.query_string.decode()}"
        headers = {k: v for k, v in request.headers if k.lower() != "host"}
        req = urllib.request.Request(
            url,
            method=request.method,
            data=request.get_data() or None,
            headers=headers
        )
        try:
            with urllib.request.urlopen(req) as resp:
                return Response(
                    resp.read(),
                    status=resp.status,
                    content_type=resp.headers.get("Content-Type", "application/json")
                )
        except urllib.error.HTTPError as e:
            return Response(
                e.read(),
                status=e.code,
                content_type=e.headers.get("Content-Type", "application/json")
            )
        except Exception as e:
            return {"error": str(e)}, 502

    return flask_app
