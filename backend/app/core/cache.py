import redis.asyncio as aioredis
from app.core.config import get_settings
import json
import time
from typing import Any, Optional, Dict, Tuple

settings = get_settings()

_redis: Optional[aioredis.Redis] = None
_redis_healthy = True

# In-memory fallback cache: dict of key -> (value_json, expire_timestamp)
_mem_cache: Dict[str, Tuple[str, float]] = {}


async def get_redis() -> Optional[aioredis.Redis]:
    global _redis, _redis_healthy
    if not _redis_healthy:
        return None
    
    if _redis is None:
        try:
            _redis = aioredis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=1.0,  # fast fail if down
            )
            # Try a quick ping to verify health
            await _redis.ping()
        except Exception:
            print("[WARNING] Redis connection failed. Falling back to In-Memory Cache.")
            _redis_healthy = False
            _redis = None
            
    return _redis


async def cache_get(key: str) -> Optional[Any]:
    global _redis_healthy
    
    # 1. Try Redis first
    redis = await get_redis()
    if redis:
        try:
            data = await redis.get(key)
            if data:
                return json.loads(data)
            return None
        except Exception:
            print("[WARNING] Redis read failed. Switching to In-Memory fallback.")
            _redis_healthy = False

    # 2. In-Memory fallback
    if key in _mem_cache:
        val_json, expire = _mem_cache[key]
        if expire > time.time():
            return json.loads(val_json)
        else:
            del _mem_cache[key] # Expired
    return None


async def cache_set(key: str, value: Any, ttl: int = None) -> None:
    global _redis_healthy
    ttl = ttl or settings.cache_ttl
    
    # 1. Try Redis first
    redis = await get_redis()
    if redis:
        try:
            await redis.setex(key, ttl, json.dumps(value, default=str))
            return
        except Exception:
            print("[WARNING] Redis write failed. Switching to In-Memory fallback.")
            _redis_healthy = False

    # 2. In-Memory fallback
    expire = time.time() + ttl
    _mem_cache[key] = (json.dumps(value, default=str), expire)


async def cache_delete(key: str) -> None:
    global _redis_healthy
    
    redis = await get_redis()
    if redis:
        try:
            await redis.delete(key)
            return
        except Exception:
            _redis_healthy = False
            
    if key in _mem_cache:
        del _mem_cache[key]


async def cache_delete_pattern(pattern: str) -> None:
    global _redis_healthy
    
    redis = await get_redis()
    if redis:
        try:
            keys = await redis.keys(pattern)
            if keys:
                await redis.delete(*keys)
            return
        except Exception:
            _redis_healthy = False

    # Simple in-memory pattern delete (matching basic '*' at end)
    if pattern.endswith("*"):
        prefix = pattern[:-1]
        keys_to_del = [k for k in _mem_cache.keys() if k.startswith(prefix)]
        for k in keys_to_del:
            del _mem_cache[k]
