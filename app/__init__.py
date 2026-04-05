import os, csv, random, string
from datetime import datetime
from flask import Flask, request, jsonify, redirect
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import DeclarativeBase, relationship, sessionmaker
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL") or f"postgresql+psycopg2://{os.getenv('DATABASE_USER','postgres')}:{os.getenv('DATABASE_PASSWORD','postgres')}@{os.getenv('DATABASE_HOST','postgres')}:{os.getenv('DATABASE_PORT','5432')}/{os.getenv('DATABASE_NAME','url_shortener')}"
DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://","postgresql+psycopg2://")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)
class Base(DeclarativeBase): pass
class User(Base):
    __tablename__="users"
    id=Column(Integer,primary_key=True,autoincrement=True)
    username=Column(String(255),unique=True,nullable=False)
    email=Column(String(255),unique=True,nullable=False)
    created_at=Column(DateTime,server_default=func.now(),nullable=False)
    urls=relationship("URL",back_populates="user",cascade="all, delete-orphan")
class URL(Base):
    __tablename__="urls"
    id=Column(Integer,primary_key=True,autoincrement=True)
    user_id=Column(Integer,ForeignKey("users.id",ondelete="CASCADE"),nullable=False)
    short_code=Column(String(10),unique=True,nullable=False)
    original_url=Column(Text,nullable=False)
    title=Column(String(255),nullable=True)
    is_active=Column(Boolean,nullable=False,default=True)
    created_at=Column(DateTime,server_default=func.now(),nullable=False)
    updated_at=Column(DateTime,server_default=func.now(),nullable=False)
    user=relationship("User",back_populates="urls")
    events=relationship("Event",back_populates="url",cascade="all, delete-orphan")
class Event(Base):
    __tablename__="events"
    id=Column(Integer,primary_key=True,autoincrement=True)
    url_id=Column(Integer,ForeignKey("urls.id",ondelete="SET NULL"),nullable=True)
    user_id=Column(Integer,ForeignKey("users.id",ondelete="SET NULL"),nullable=True)
    event_type=Column(String(64),nullable=False)
    timestamp=Column(DateTime,server_default=func.now(),nullable=False)
    details=Column(JSON,nullable=False,default=dict)
    url=relationship("URL",back_populates="events")
def gen_short_code(n=6): return ''.join(random.choices(string.ascii_letters+string.digits,k=n))
def ud(u): return {"id":u.id,"username":u.username,"email":u.email,"created_at":u.created_at.isoformat() if u.created_at else None}
def urld(u): return {"id":u.id,"user_id":u.user_id,"short_code":u.short_code,"original_url":u.original_url,"title":u.title,"is_active":u.is_active,"created_at":u.created_at.isoformat() if u.created_at else None,"updated_at":u.updated_at.isoformat() if u.updated_at else None}
def ed(e): return {"id":e.id,"url_id":e.url_id,"user_id":e.user_id,"event_type":e.event_type,"timestamp":e.timestamp.isoformat() if e.timestamp else None,"details":e.details}
def list_resp(items): return {"kind":"list","sample":items,"total_items":len(items)}
def seed_db():
    with SessionLocal() as db:
        if db.query(User).count() > 0: return
        for fname in ["backend/data/users.csv","data/users.csv","/app/backend/data/users.csv","users.csv"]:
            try:
                with open(fname,newline="") as f:
                    for row in csv.DictReader(f):
                        if not db.query(User).filter_by(username=row["username"]).first():
                            u=User(username=row["username"],email=row["email"])
                            if row.get("id"): u.id=int(row["id"])
                            db.add(u)
                db.commit(); break
            except FileNotFoundError: continue
def create_app():
    app=Flask(__name__)
    Base.metadata.create_all(engine)
    seed_db()
    @app.route("/health")
    def health(): return jsonify({"status":"ok"}),200
    @app.route("/users",methods=["GET"])
    def get_users():
        with SessionLocal() as db:
            q=db.query(User)
            page=request.args.get("page",type=int); pp=request.args.get("per_page",type=int)
            total=q.count()
            if page and pp: q=q.offset((page-1)*pp).limit(pp)
            items=[ud(u) for u in q.all()]
            return jsonify({"kind":"list","sample":items,"total_items":total}),200
    @app.route("/users/bulk",methods=["POST"])
    def bulk_users():
        data=request.get_json(force=True,silent=True) or {}
        filename=data.get("file","users.csv")
        with SessionLocal() as db:
            for path in [f"backend/data/{filename}", f"data/{filename}", f"/app/backend/data/{filename}", f"/app/data/{filename}", filename]:
                try:
                    with open(path,newline="") as f: rows=list(csv.DictReader(f))
                    count=0
                    for row in rows:
                        existing=db.query(User).filter_by(username=row["username"]).first()
                        if existing: existing.email=row["email"]
                        else: db.add(User(username=row["username"],email=row["email"])); count+=1
                    db.commit(); return jsonify({"imported":len(rows),"loaded":len(rows)}),201
                except FileNotFoundError: continue
            return jsonify({"error":"file not found"}),400
    @app.route("/users/<int:uid>",methods=["GET"])
    def get_user(uid):
        with SessionLocal() as db:
            u=db.get(User,uid)
            return (jsonify(ud(u)),200) if u else (jsonify({"detail":"Not found"}),404)
    @app.route("/users",methods=["POST"])
    def create_user():
        data=request.get_json(force=True)
        with SessionLocal() as db:
            existing=db.query(User).filter_by(username=data["username"]).first()
            if existing: return jsonify(ud(existing)),200
            u=User(username=data["username"],email=data["email"]); db.add(u)
            try: db.commit(); db.refresh(u); return jsonify(ud(u)),201
            except IntegrityError: db.rollback(); return jsonify({"detail":"Already exists"}),409
    @app.route("/users/<int:uid>",methods=["PUT","PATCH"])
    def update_user(uid):
        data=request.get_json(force=True)
        with SessionLocal() as db:
            u=db.get(User,uid)
            if not u: return jsonify({"detail":"Not found"}),404
            [setattr(u,k,v) for k,v in data.items()]; db.commit(); db.refresh(u); return jsonify(ud(u)),200
    @app.route("/users/<int:uid>",methods=["DELETE"])
    def delete_user(uid):
        with SessionLocal() as db:
            u=db.get(User,uid)
            if not u: return jsonify({"detail":"Not found"}),404
            db.delete(u); db.commit(); return jsonify({"detail":"Deleted"}),200
    @app.route("/urls",methods=["GET"])
    def get_urls():
        with SessionLocal() as db:
            q=db.query(URL)
            if "user_id" in request.args: q=q.filter(URL.user_id==request.args.get("user_id",type=int))
            if "is_active" in request.args: q=q.filter(URL.is_active==(request.args.get("is_active").lower()=="true"))
            total=q.count(); items=[urld(u) for u in q.all()]
            return jsonify({"kind":"list","sample":items,"total_items":total}),200
    @app.route("/urls/<int:uid>",methods=["GET"])
    def get_url(uid):
        with SessionLocal() as db:
            u=db.get(URL,uid)
            return (jsonify(urld(u)),200) if u else (jsonify({"detail":"Not found"}),404)
    @app.route("/urls",methods=["POST"])
    def create_url():
        data=request.get_json(force=True)
        with SessionLocal() as db:
            code=gen_short_code()
            while db.query(URL).filter_by(short_code=code).first(): code=gen_short_code()
            u=URL(user_id=data["user_id"],short_code=code,original_url=data["original_url"],title=data.get("title")); db.add(u); db.commit(); db.refresh(u); return jsonify(urld(u)),201
    @app.route("/urls/<int:uid>",methods=["PUT","PATCH"])
    def update_url(uid):
        data=request.get_json(force=True)
        with SessionLocal() as db:
            u=db.get(URL,uid)
            if not u: return jsonify({"detail":"Not found"}),404
            [setattr(u,k,v) for k,v in data.items()]; u.updated_at=datetime.utcnow(); db.commit(); db.refresh(u); return jsonify(urld(u)),200
    @app.route("/urls/<int:uid>",methods=["DELETE"])
    def delete_url(uid):
        with SessionLocal() as db:
            u=db.get(URL,uid)
            if not u: return jsonify({"detail":"Not found"}),404
            db.delete(u); db.commit(); return jsonify({"detail":"Deleted"}),200
    @app.route("/<short_code>",methods=["GET"])
    def redirect_short(short_code):
        with SessionLocal() as db:
            u=db.query(URL).filter_by(short_code=short_code,is_active=True).first()
            return redirect(u.original_url,302) if u else (jsonify({"detail":"Not found"}),404)
    @app.route("/events",methods=["GET"])
    def get_events():
        with SessionLocal() as db:
            q=db.query(Event)
            if "url_id" in request.args: q=q.filter(Event.url_id==request.args.get("url_id",type=int))
            if "user_id" in request.args: q=q.filter(Event.user_id==request.args.get("user_id",type=int))
            if "event_type" in request.args: q=q.filter(Event.event_type==request.args.get("event_type"))
            total=q.count(); items=[ed(e) for e in q.all()]
            return jsonify({"kind":"list","sample":items,"total_items":total}),200
    @app.route("/events/<int:eid>",methods=["GET"])
    def get_event(eid):
        with SessionLocal() as db:
            e=db.get(Event,eid)
            return (jsonify(ed(e)),200) if e else (jsonify({"detail":"Not found"}),404)
    @app.route("/events",methods=["POST"])
    def create_event():
        data=request.get_json(force=True)
        with SessionLocal() as db:
            e=Event(url_id=data.get("url_id"),user_id=data.get("user_id"),event_type=data["event_type"],details=data.get("details",{})); db.add(e); db.commit(); db.refresh(e); return jsonify(ed(e)),201
    return app
