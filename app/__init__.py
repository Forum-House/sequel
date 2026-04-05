def create_app():
    from app.main import app as fastapi_app
    from a2wsgi import ASGIMiddleware
    return ASGIMiddleware(fastapi_app)
