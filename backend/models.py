"""
SkillBridge — SQLAlchemy Database Models
Supabase PostgreSQL Schema mapping
"""

from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey, Numeric, ARRAY
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(String(128), primary_key=True)  # Firebase UID
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    avatar_url = Column(Text, nullable=True)
    active_role = Column(String(20), default="buyer", nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    seller_profile = relationship("SellerProfile", back_populates="user", uselist=False)

class SellerProfile(Base):
    __tablename__ = "seller_profiles"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(128), ForeignKey("users.id"), unique=True, nullable=False)
    college_name = Column(String(200), nullable=False)
    graduation_year = Column(Integer, nullable=False)
    major = Column(String(150), nullable=False)
    bio = Column(Text, nullable=False)
    skills = Column(ARRAY(String), default=list)
    hourly_rate = Column(Integer, default=500, nullable=False)
    portfolio_url = Column(Text, nullable=True)
    github_url = Column(Text, nullable=True)
    linkedin_url = Column(Text, nullable=True)
    is_onboarded = Column(Boolean, default=True)
    is_promoted = Column(Boolean, default=False)
    subscription_tier = Column(String(20), default="free")
    total_orders_completed = Column(Integer, default=0)
    average_rating = Column(Numeric(3, 2), default=5.0)
    rating_count = Column(Integer, default=0)

    user = relationship("User", back_populates="seller_profile")

class Gig(Base):
    __tablename__ = "gigs"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    seller_id = Column(String(128), ForeignKey("users.id"), nullable=False)
    category_id = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Integer, nullable=False)
    delivery_days = Column(Integer, nullable=False)
    revisions_included = Column(Integer, default=2)
    tags = Column(ARRAY(String), default=list)
    cover_image = Column(Text, nullable=True)
    is_published = Column(Boolean, default=True)
    is_promoted = Column(Boolean, default=False)
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = Column(String(32), unique=True, nullable=False)
    gig_id = Column(String(36), ForeignKey("gigs.id"), nullable=True)
    project_id = Column(String(36), nullable=True)
    buyer_id = Column(String(128), ForeignKey("users.id"), nullable=False)
    seller_id = Column(String(128), ForeignKey("users.id"), nullable=False)
    title = Column(String(250), nullable=False)
    amount = Column(Integer, nullable=False)
    requirements = Column(Text, nullable=True)
    delivery_days = Column(Integer, default=3)
    status = Column(String(20), default="in_progress")  # in_progress, delivered, completed, disputed, cancelled
    delivery_note = Column(Text, nullable=True)
    delivery_attachment_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Review(Base):
    __tablename__ = "reviews"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id"), unique=True, nullable=False)
    buyer_id = Column(String(128), ForeignKey("users.id"), nullable=False)
    seller_id = Column(String(128), ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SellerSubscription(Base):
    __tablename__ = "seller_subscriptions"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    seller_id = Column(String(128), ForeignKey("users.id"), unique=True, nullable=False)
    plan_id = Column(String(50), nullable=False)
    status = Column(String(20), default="active")
    razorpay_subscription_id = Column(String(100), nullable=True)
    current_period_start = Column(DateTime, default=datetime.utcnow)
    current_period_end = Column(DateTime, nullable=False)
    cancel_at_period_end = Column(Boolean, default=False)
