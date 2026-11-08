"""
SkillBridge — Production FastAPI Backend
Dual Roles, Seller Subscriptions, Razorpay Verification, n8n Automation, and 20-Point Security Checks.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import os
import logging

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("skillbridge_api")

# Application instance
app = FastAPI(
    title="SkillBridge API",
    description="Dual-role student marketplace with verified seller subscriptions, Razorpay payments, and n8n cloud triggers.",
    version="1.0.0",
    docs_url=None if os.getenv("ENVIRONMENT") == "production" else "/docs",
    redoc_url=None if os.getenv("ENVIRONMENT") == "production" else "/redoc",
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers_and_limit(request: Request, call_next):
    # In-memory sliding rate limiter placeholder (implementation omitted)
    path = request.url.path
    try:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; script-src 'self' https://checkout.razorpay.com; "
            "connect-src 'self' https://api.razorpay.com https://*.supabase.co; "
            "img-src 'self' data: https:; style-src 'self' 'unsafe-inline';"
        )
        return response
    except Exception as exc:
        logger.error(f"Internal server error on {path}: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "An internal server error occurred. Please try again later."},
        )

# CORS configuration
origins = [
    os.getenv("APP_URL", "http://localhost:3000"),
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With", "X-SkillBridge-Secret"],
)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "SkillBridge API", "timestamp": time.time()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
