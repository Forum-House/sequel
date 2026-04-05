def create_app():
    from app.main import app as fastapi_app

    return fastapi_app
