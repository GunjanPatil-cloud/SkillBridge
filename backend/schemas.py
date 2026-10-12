"""
SkillBridge — Pydantic Schemas with strict input validation
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from datetime import datetime

class SellerOnboardRequest(BaseModel):
    college_name: str = Field(..., min_length=3, max_length=200)
    graduation_year: int = Field(..., ge=2020, le=2035)
    major: str = Field(..., min_length=2, max_length=150)
    bio: str = Field(..., min_length=25, max_length=2000)
    skills: List[str] = Field(..., min_items=1)
    hourly_rate: int = Field(500, ge=100, le=50000)
    portfolio_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

class CreateGigRequest(BaseModel):
    title: str = Field(..., min_length=10, max_length=200)
    description: str = Field(..., min_length=30, max_length=5000)
    category_id: str
    price: int = Field(..., ge=100)
    delivery_days: int = Field(..., ge=1, le=90)
    tags: List[str] = Field(default_factory=list)
    cover_image: Optional[str] = None

class CreateOrderRequest(BaseModel):
    gig_id: Optional[str] = None
    project_id: Optional[str] = None
    requirements: str = Field(..., min_length=10)

class OrderDeliverRequest(BaseModel):
    delivery_note: str = Field(..., min_length=10)
    attachment_url: Optional[str] = None

class OrderReviewRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=5, max_length=1500)

class CreateSubscriptionOrderRequest(BaseModel):
    plan_id: str

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan_id: str
