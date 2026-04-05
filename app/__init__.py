def create_app():
    from flask import Flask
    flask_app = Flask(__name__)

    @flask_app.route("/health")
    def health():
        return {"status": "ok"}, 200

    @flask_app.route("/<short_code>")
    def redirect_url(short_code):
        return {"error": "use the docker stack for full functionality"}, 501

    return flask_app
