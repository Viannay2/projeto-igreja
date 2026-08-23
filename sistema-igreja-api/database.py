from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Isso cria (ou usa, se já existir) um arquivo "sistema_igreja.db"
# na mesma pasta do main.py — é o banco inteiro, guardado em disco.
SQLALCHEMY_DATABASE_URL = "sqlite:///./sistema_igreja.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # necessário pro SQLite funcionar com FastAPI
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Toda rota que precisa falar com o banco usa essa função (via Depends).
# Ela abre uma "conversa" com o banco, empresta pra rota usar, e
# fecha sozinha no final — mesmo se der erro no meio.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()