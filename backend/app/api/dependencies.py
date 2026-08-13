"""FastAPI dependency for Zero Trust JWT authentication.

Verifies Auth.js-signed JWTs using the shared AUTH_SECRET.
Extracts the authenticated user_id from the token claims.
"""

import logging

import jwt
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

logger = logging.getLogger(__name__)

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),  # noqa: B008
) -> str:
    """Decode and verify the Auth.js JWT, returning the user_id.

    Auth.js v5 encodes the user's DB UUID in the 'id' claim
    (set by the jwt callback) and the provider-level ID in 'sub'.
    We prefer 'id' for the canonical Supabase user UUID.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.auth_secret,
            algorithms=["HS256"],
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as exc:
        logger.warning("JWT validation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Auth.js jwt callback sets 'id' to the DB user UUID.
    user_id: str | None = payload.get("id") or payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user identity claim",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id
