import socket
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import get_settings

settings = get_settings()


class Base(DeclarativeBase):
    pass


database_url = settings.database_url
is_sqlite = "sqlite" in database_url

if not is_sqlite:
    # Strip query parameters — asyncpg doesn't accept sslmode etc as URL args
    if "?" in database_url:
        database_url = database_url.split("?")[0]

    # Auto-fix driver prefix: postgresql:// → postgresql+asyncpg://
    if database_url.startswith("postgresql://") or database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    # Parse host/port to check if it's local
    host = "localhost"
    port = 5432
    if "@" in database_url:
        host_part = database_url.split("@")[1].split("/")[0]
        if ":" in host_part:
            host = host_part.split(":")[0]
            try:
                port = int(host_part.split(":")[1].split("?")[0])
            except ValueError:
                pass
        else:
            host = host_part.split("?")[0]

    # Only check socket if host is local — skip for remote cloud DBs (Neon, Supabase etc)
    is_local = host in ("localhost", "127.0.0.1", "0.0.0.0")
    if is_local:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.5)
            s.connect((host, port))
            s.close()
        except Exception:
            print("[WARNING] Local PostgreSQL is offline. Falling back to local SQLite.")
            database_url = "sqlite+aiosqlite:///./cpos.db"
            is_sqlite = True

if is_sqlite:
    engine = create_async_engine(
        database_url,
        echo=settings.debug,
    )
else:
    engine = create_async_engine(
        database_url,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        echo=settings.debug,
    )

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
