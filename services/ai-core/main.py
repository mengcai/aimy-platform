"""
AIMY AI Core Service
FastAPI application for AI-powered asset valuation, risk assessment, and yield prediction
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
import os
import json
import logging
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
import lightgbm as lgb
import joblib
import redis
from celery import Celery
import psycopg2
from psycopg2.extras import RealDictCursor
import minio
from minio.error import S3Error
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AIMY AI Core Service",
    description="AI-powered valuation, yield prediction, risk scoring, and anomaly detection for real-world assets",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
POSTGRES_URL = os.getenv("POSTGRES_URL", "postgresql://postgres:postgres@localhost:5432/aimy_ai")
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "ai-models")

# Initialize connections
redis_client = redis.from_url(REDIS_URL)
celery_app = Celery("ai_core", broker=REDIS_URL)

# MinIO client
minio_client = minio.Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False
)

# Ensure MinIO bucket exists
try:
    if not minio_client.bucket_exists(MINIO_BUCKET):
        minio_client.make_bucket(MINIO_BUCKET)
        logger.info(f"Created MinIO bucket: {MINIO_BUCKET}")
except Exception as e:
    logger.warning(f"Could not create MinIO bucket: {e}")

# Data models
class CashflowData(BaseModel):
    asset_id: str = Field(..., description="Asset identifier")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    amount: float = Field(..., description="Cashflow amount")
    type: str = Field(..., description="Cashflow type: revenue, expense, etc.")
    category: Optional[str] = Field(None, description="Cashflow category")

class MarketData(BaseModel):
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    interest_rate: float = Field(..., description="Market interest rate")
    inflation_rate: float = Field(..., description="Inflation rate")
    market_volatility: float = Field(..., description="Market volatility index")

class IoTData(BaseModel):
    asset_id: str = Field(..., description="Asset identifier")
    timestamp: str = Field(..., description="ISO timestamp")
    sensor_type: str = Field(..., description="Sensor type")
    value: float = Field(..., description="Sensor value")
    unit: str = Field(..., description="Value unit")

class UtilizationData(BaseModel):
    asset_id: str = Field(..., description="Asset identifier")
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    utilization_rate: float = Field(..., description="Asset utilization rate (0-1)")
    capacity: float = Field(..., description="Asset capacity")
    efficiency: float = Field(..., description="Operational efficiency")

class PricingRequest(BaseModel):
    asset_id: str = Field(..., description="Asset identifier")
    cashflows: List[CashflowData] = Field(..., description="Historical cashflow data")
    market_data: List[MarketData] = Field(..., description="Market rate data")
    utilization: List[UtilizationData] = Field(..., description="Utilization data")
    iot_data: Optional[List[IoTData]] = Field(None, description="IoT sensor data")
    valuation_date: str = Field(..., description="Valuation date")

class YieldRequest(BaseModel):
    asset_id: str = Field(..., description="Asset identifier")
    historical_yields: List[float] = Field(..., description="Historical yield data")
    market_conditions: Dict[str, Any] = Field(..., description="Market condition factors")
    forecast_horizon: int = Field(12, description="Forecast horizon in months")

class RiskRequest(BaseModel):
    asset_id: str = Field(..., description="Asset identifier")
    financial_metrics: Dict[str, float] = Field(..., description="Financial metrics")
    market_exposure: Dict[str, float] = Field(..., description="Market exposure factors")
    operational_metrics: Dict[str, float] = Field(..., description="Operational metrics")

class AnomalyRequest(BaseModel):
    asset_id: str = Field(..., description="Asset identifier")
    time_series_data: List[Dict[str, Any]] = Field(..., description="Time series data for anomaly detection")

# Response models
class PricingResponse(BaseModel):
    asset_id: str
    valuation_date: str
    estimated_value: float
    confidence_interval: Dict[str, float]
    feature_importance: Dict[str, float]
    model_version: str
    timestamp: str

class YieldResponse(BaseModel):
    asset_id: str
    forecast_horizon: int
    predicted_yields: List[float]
    confidence_intervals: List[Dict[str, float]]
    feature_importance: Dict[str, float]
    model_version: str
    timestamp: str

class RiskResponse(BaseModel):
    asset_id: str
    risk_score: float
    risk_level: str
    risk_factors: Dict[str, float]
    confidence_interval: Dict[str, float]
    model_version: str
    timestamp: str

class AnomalyResponse(BaseModel):
    asset_id: str
    anomalies_detected: List[Dict[str, Any]]
    anomaly_score: float
    confidence_interval: Dict[str, float]
    model_version: str
    timestamp: str

class MetricsResponse(BaseModel):
    total_requests: int
    successful_requests: int
    failed_requests: int
    average_response_time: float
    model_performance: Dict[str, Dict[str, float]]
    last_updated: str

# Mock data generators
def generate_mock_cashflows(asset_id: str, days: int = 365) -> List[CashflowData]:
    """Generate mock cashflow data for testing"""
    cashflows = []
    base_date = datetime.now() - timedelta(days=days)
    
    for i in range(days):
        date = base_date + timedelta(days=i)
        # Generate realistic cashflow patterns
        if i % 30 == 0:  # Monthly revenue
            amount = np.random.normal(10000, 2000)
            cashflows.append(CashflowData(
                asset_id=asset_id,
                date=date.strftime("%Y-%m-%d"),
                amount=amount,
                type="revenue",
                category="monthly"
            ))
        elif i % 7 == 0:  # Weekly expenses
            amount = np.random.normal(-2000, 500)
            cashflows.append(CashflowData(
                asset_id=asset_id,
                date=date.strftime("%Y-%m-%d"),
                amount=amount,
                type="expense",
                category="operational"
            ))
    
    return cashflows

def generate_mock_market_data(days: int = 365) -> List[MarketData]:
    """Generate mock market data for testing"""
    market_data = []
    base_date = datetime.now() - timedelta(days=days)
    
    # Start with realistic base values
    interest_rate = 0.05
    inflation_rate = 0.02
    volatility = 0.15
    
    for i in range(days):
        date = base_date + timedelta(days=i)
        # Add some random walk behavior
        interest_rate += np.random.normal(0, 0.001)
        inflation_rate += np.random.normal(0, 0.0005)
        volatility += np.random.normal(0, 0.002)
        
        # Keep values in reasonable ranges
        interest_rate = max(0, min(0.15, interest_rate))
        inflation_rate = max(-0.05, min(0.10, inflation_rate))
        volatility = max(0.05, min(0.50, volatility))
        
        market_data.append(MarketData(
            date=date.strftime("%Y-%m-%d"),
            interest_rate=interest_rate,
            inflation_rate=inflation_rate,
            market_volatility=volatility
        ))
    
    return market_data

def generate_mock_iot_data(asset_id: str, hours: int = 8760) -> List[IoTData]:
    """Generate mock IoT sensor data for testing"""
    iot_data = []
    base_timestamp = datetime.now() - timedelta(hours=hours)
    
    sensor_types = ["temperature", "pressure", "vibration", "efficiency"]
    
    for i in range(hours):
        timestamp = base_timestamp + timedelta(hours=i)
        
        for sensor_type in sensor_types:
            if sensor_type == "temperature":
                value = np.random.normal(25, 5)  # Celsius
                unit = "°C"
            elif sensor_type == "pressure":
                value = np.random.normal(100, 10)  # kPa
                unit = "kPa"
            elif sensor_type == "vibration":
                value = np.random.normal(0.1, 0.05)  # m/s²
                unit = "m/s²"
            else:  # efficiency
                value = np.random.normal(0.85, 0.1)  # percentage
                unit = "%"
            
            iot_data.append(IoTData(
                asset_id=asset_id,
                timestamp=timestamp.isoformat(),
                sensor_type=sensor_type,
                value=value,
                unit=unit
            ))
    
    return iot_data

def generate_mock_utilization(asset_id: str, days: int = 365) -> List[UtilizationData]:
    """Generate mock utilization data for testing"""
    utilization = []
    base_date = datetime.now() - timedelta(days=days)
    
    for i in range(days):
        date = base_date + timedelta(days=i)
        # Generate realistic utilization patterns with seasonal variations
        seasonal_factor = 1 + 0.2 * np.sin(2 * np.pi * i / 365)
        utilization_rate = np.random.normal(0.7, 0.1) * seasonal_factor
        utilization_rate = max(0, min(1, utilization_rate))
        
        capacity = 1000  # Fixed capacity
        efficiency = np.random.normal(0.85, 0.05)
        efficiency = max(0.5, min(1, efficiency))
        
        utilization.append(UtilizationData(
            asset_id=asset_id,
            date=date.strftime("%Y-%m-%d"),
            utilization_rate=utilization_rate,
            capacity=capacity,
            efficiency=efficiency
        ))
    
    return utilization

# Model management
class ModelManager:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.model_versions = {}
        self.load_models()
    
    def load_models(self):
        """Load or initialize models"""
        try:
            # Try to load existing models from MinIO
            self.load_model_from_storage("pricing")
            self.load_model_from_storage("yield")
            self.load_model_from_storage("risk")
            self.load_model_from_storage("anomaly")
        except Exception as e:
            logger.warning(f"Could not load existing models, initializing new ones: {e}")
            self.initialize_models()
    
    def initialize_models(self):
        """Initialize new models with default parameters"""
        # Pricing model
        self.models["pricing"] = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scalers["pricing"] = StandardScaler()
        
        # Yield prediction model
        self.models["yield"] = lgb.LGBMRegressor(n_estimators=100, random_state=42)
        self.scalers["yield"] = StandardScaler()
        
        # Risk scoring model
        self.models["risk"] = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scalers["risk"] = StandardScaler()
        
        # Anomaly detection model
        self.models["anomaly"] = IsolationForest(contamination=0.1, random_state=42)
        self.scalers["anomaly"] = StandardScaler()
        
        # Set model versions
        for model_name in self.models:
            self.model_versions[model_name] = f"v1.0.0-{datetime.now().strftime('%Y%m%d')}"
        
        logger.info("Initialized new models")
    
    def load_model_from_storage(self, model_name: str):
        """Load model from MinIO storage"""
        try:
            model_key = f"models/{model_name}/model.pkl"
            scaler_key = f"models/{model_name}/scaler.pkl"
            
            # Download model files
            minio_client.fget_object(MINIO_BUCKET, model_key, f"/tmp/{model_name}_model.pkl")
            minio_client.fget_object(MINIO_BUCKET, scaler_key, f"/tmp/{model_name}_scaler.pkl")
            
            # Load models
            self.models[model_name] = joblib.load(f"/tmp/{model_name}_model.pkl")
            self.scalers[model_name] = joblib.load(f"/tmp/{model_name}_scaler.pkl")
            
            # Get model version from metadata
            try:
                metadata_key = f"models/{model_name}/metadata.json"
                metadata_obj = minio_client.get_object(MINIO_BUCKET, metadata_key)
                metadata = json.loads(metadata_obj.read())
                self.model_versions[model_name] = metadata.get("version", "unknown")
            except:
                self.model_versions[model_name] = "unknown"
            
            logger.info(f"Loaded {model_name} model from storage")
            
        except Exception as e:
            logger.warning(f"Could not load {model_name} model from storage: {e}")
            raise
    
    def save_model_to_storage(self, model_name: str):
        """Save model to MinIO storage"""
        try:
            # Save model files locally first
            model_path = f"/tmp/{model_name}_model.pkl"
            scaler_path = f"/tmp/{model_name}_scaler.pkl"
            
            joblib.dump(self.models[model_name], model_path)
            joblib.dump(self.scalers[model_name], scaler_path)
            
            # Upload to MinIO
            model_key = f"models/{model_name}/model.pkl"
            scaler_key = f"models/{model_name}/scaler.pkl"
            
            minio_client.fput_object(MINIO_BUCKET, model_key, model_path)
            minio_client.fput_object(MINIO_BUCKET, scaler_key, scaler_path)
            
            # Save metadata
            metadata = {
                "version": self.model_versions[model_name],
                "last_updated": datetime.now().isoformat(),
                "model_type": type(self.models[model_name]).__name__,
                "scaler_type": type(self.scalers[model_name]).__name__
            }
            
            metadata_key = f"models/{model_name}/metadata.json"
            minio_client.put_object(
                MINIO_BUCKET, 
                metadata_key, 
                json.dumps(metadata).encode(),
                length=len(json.dumps(metadata))
            )
            
            logger.info(f"Saved {model_name} model to storage")
            
        except Exception as e:
            logger.error(f"Could not save {model_name} model to storage: {e}")
            raise

# Initialize model manager
model_manager = ModelManager()

# Feature engineering functions
def extract_pricing_features(cashflows: List[CashflowData], market_data: List[MarketData], utilization: List[UtilizationData]) -> np.ndarray:
    """Extract features for pricing model"""
    features = []
    
    # Aggregate cashflow features
    cashflow_df = pd.DataFrame([cf.dict() for cf in cashflows])
    cashflow_df['date'] = pd.to_datetime(cashflow_df['date'])
    
    # Monthly aggregates
    monthly_revenue = cashflow_df[cashflow_df['type'] == 'revenue'].groupby(
        cashflow_df['date'].dt.to_period('M')
    )['amount'].sum()
    
    monthly_expenses = cashflow_df[cashflow_df['type'] == 'expense'].groupby(
        cashflow_df['date'].dt.to_period('M')
    )['amount'].sum()
    
    # Market data features
    market_df = pd.DataFrame([md.dict() for md in market_data])
    market_df['date'] = pd.to_datetime(market_df['date'])
    
    # Utilization features
    util_df = pd.DataFrame([u.dict() for u in utilization])
    util_df['date'] = pd.to_datetime(util_df['date'])
    
    # Combine features
    features = [
        monthly_revenue.mean() if len(monthly_revenue) > 0 else 0,
        monthly_revenue.std() if len(monthly_revenue) > 0 else 0,
        monthly_expenses.mean() if len(monthly_expenses) > 0 else 0,
        monthly_expenses.std() if len(monthly_expenses) > 0 else 0,
        market_df['interest_rate'].mean(),
        market_df['inflation_rate'].mean(),
        market_df['market_volatility'].mean(),
        util_df['utilization_rate'].mean(),
        util_df['efficiency'].mean(),
        len(cashflows),  # Number of cashflow records
        len(market_data),  # Number of market data points
        len(utilization)   # Number of utilization records
    ]
    
    return np.array(features).reshape(1, -1)

def extract_yield_features(historical_yields: List[float], market_conditions: Dict[str, Any]) -> np.ndarray:
    """Extract features for yield prediction"""
    features = []
    
    # Historical yield statistics
    yields = np.array(historical_yields)
    features.extend([
        yields.mean(),
        yields.std(),
        yields.min(),
        yields.max(),
        len(yields)
    ])
    
    # Market condition features
    features.extend([
        market_conditions.get('interest_rate', 0),
        market_conditions.get('inflation_rate', 0),
        market_conditions.get('market_volatility', 0),
        market_conditions.get('economic_growth', 0),
        market_conditions.get('sector_performance', 0)
    ])
    
    return np.array(features).reshape(1, -1)

def extract_risk_features(financial_metrics: Dict[str, float], market_exposure: Dict[str, float], operational_metrics: Dict[str, float]) -> np.ndarray:
    """Extract features for risk scoring"""
    features = []
    
    # Financial metrics
    features.extend([
        financial_metrics.get('debt_to_equity', 0),
        financial_metrics.get('current_ratio', 0),
        financial_metrics.get('profit_margin', 0),
        financial_metrics.get('return_on_equity', 0),
        financial_metrics.get('cash_flow_coverage', 0)
    ])
    
    # Market exposure
    features.extend([
        market_exposure.get('interest_rate_sensitivity', 0),
        market_exposure.get('currency_exposure', 0),
        market_exposure.get('commodity_exposure', 0),
        market_exposure.get('geographic_concentration', 0),
        market_exposure.get('sector_concentration', 0)
    ])
    
    # Operational metrics
    features.extend([
        operational_metrics.get('utilization_rate', 0),
        operational_metrics.get('efficiency', 0),
        operational_metrics.get('maintenance_ratio', 0),
        operational_metrics.get('staff_turnover', 0),
        operational_metrics.get('quality_score', 0)
    ])
    
    return np.array(features).reshape(1, -1)

def extract_anomaly_features(time_series_data: List[Dict[str, Any]]) -> np.ndarray:
    """Extract features for anomaly detection"""
    features = []
    
    # Convert to DataFrame for easier processing
    df = pd.DataFrame(time_series_data)
    
    if 'value' in df.columns:
        values = df['value'].values
        
        # Statistical features
        features.extend([
            values.mean(),
            values.std(),
            values.min(),
            values.max(),
            np.percentile(values, 25),
            np.percentile(values, 75),
            len(values)
        ])
        
        # Trend features
        if len(values) > 1:
            trend = np.polyfit(range(len(values)), values, 1)[0]
            features.append(trend)
        else:
            features.append(0)
    else:
        # Default features if no value column
        features = [0, 0, 0, 0, 0, 0, len(time_series_data), 0]
    
    return np.array(features).reshape(1, -1)

# API endpoints
@app.get("/")
async def root():
    return {"message": "AIMY AI Core Service", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "ai-core",
        "models_loaded": list(model_manager.models.keys())
    }

@app.post("/price", response_model=PricingResponse)
async def price_asset(request: PricingRequest):
    """Price an asset based on historical data and market conditions"""
    try:
        # Extract features
        features = extract_pricing_features(
            request.cashflows, 
            request.market_data, 
            request.utilization
        )
        
        # Scale features
        scaled_features = model_manager.scalers["pricing"].transform(features)
        
        # Make prediction
        prediction = model_manager.models["pricing"].predict(scaled_features)[0]
        
        # Generate confidence interval (mock for now)
        confidence_interval = {
            "lower": prediction * 0.8,
            "upper": prediction * 1.2
        }
        
        # Generate feature importance (mock for now)
        feature_names = [
            "avg_monthly_revenue", "revenue_volatility", "avg_monthly_expenses",
            "expense_volatility", "avg_interest_rate", "avg_inflation_rate",
            "avg_market_volatility", "avg_utilization", "avg_efficiency",
            "cashflow_count", "market_data_count", "utilization_count"
        ]
        
        feature_importance = dict(zip(feature_names, np.random.random(len(feature_names))))
        
        return PricingResponse(
            asset_id=request.asset_id,
            valuation_date=request.valuation_date,
            estimated_value=prediction,
            confidence_interval=confidence_interval,
            feature_importance=feature_importance,
            model_version=model_manager.model_versions["pricing"],
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error in pricing endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict_yield", response_model=YieldResponse)
async def predict_yield(request: YieldRequest):
    """Predict future yields based on historical data and market conditions"""
    try:
        # Extract features
        features = extract_yield_features(request.historical_yields, request.market_conditions)
        
        # Scale features
        scaled_features = model_manager.scalers["yield"].transform(features)
        
        # Make prediction
        prediction = model_manager.models["yield"].predict(scaled_features)[0]
        
        # Generate forecast for the specified horizon
        predicted_yields = [prediction * (1 + np.random.normal(0, 0.05)) for _ in range(request.forecast_horizon)]
        
        # Generate confidence intervals
        confidence_intervals = [
            {
                "lower": y * 0.9,
                "upper": y * 1.1
            } for y in predicted_yields
        ]
        
        # Generate feature importance (mock for now)
        feature_names = [
            "avg_yield", "yield_std", "min_yield", "max_yield", "data_points",
            "interest_rate", "inflation_rate", "market_volatility", "economic_growth", "sector_performance"
        ]
        
        feature_importance = dict(zip(feature_names, np.random.random(len(feature_names))))
        
        return YieldResponse(
            asset_id=request.asset_id,
            forecast_horizon=request.forecast_horizon,
            predicted_yields=predicted_yields,
            confidence_intervals=confidence_intervals,
            feature_importance=feature_importance,
            model_version=model_manager.model_versions["yield"],
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error in yield prediction endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/risk_score", response_model=RiskResponse)
async def calculate_risk_score(request: RiskRequest):
    """Calculate risk score for an asset"""
    try:
        # Extract features
        features = extract_risk_features(
            request.financial_metrics,
            request.market_exposure,
            request.operational_metrics
        )
        
        # Scale features
        scaled_features = model_manager.scalers["risk"].transform(features)
        
        # Make prediction
        risk_score = model_manager.models["risk"].predict(scaled_features)[0]
        
        # Normalize risk score to 0-100 range
        risk_score = max(0, min(100, risk_score))
        
        # Determine risk level
        if risk_score < 30:
            risk_level = "LOW"
        elif risk_score < 70:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"
        
        # Generate confidence interval
        confidence_interval = {
            "lower": max(0, risk_score - 10),
            "upper": min(100, risk_score + 10)
        }
        
        # Generate risk factors (mock for now)
        risk_factors = {
            "financial_risk": np.random.random() * 100,
            "market_risk": np.random.random() * 100,
            "operational_risk": np.random.random() * 100,
            "liquidity_risk": np.random.random() * 100,
            "concentration_risk": np.random.random() * 100
        }
        
        return RiskResponse(
            asset_id=request.asset_id,
            risk_score=risk_score,
            risk_level=risk_level,
            risk_factors=risk_factors,
            confidence_interval=confidence_interval,
            model_version=model_manager.model_versions["risk"],
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error in risk scoring endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/anomaly", response_model=AnomalyResponse)
async def detect_anomalies(request: AnomalyRequest):
    """Detect anomalies in time series data"""
    try:
        # Extract features
        features = extract_anomaly_features(request.time_series_data)
        
        # Scale features
        scaled_features = model_manager.scalers["anomaly"].transform(features)
        
        # Make prediction
        anomaly_scores = model_manager.models["anomaly"].score_samples(scaled_features)
        anomaly_score = anomaly_scores[0]
        
        # Detect anomalies (scores below threshold are anomalies)
        threshold = np.percentile(anomaly_scores, 10)  # 10% threshold
        is_anomaly = anomaly_score < threshold
        
        # Generate anomaly details (mock for now)
        anomalies_detected = []
        if is_anomaly:
            anomalies_detected.append({
                "timestamp": datetime.now().isoformat(),
                "severity": "HIGH" if anomaly_score < threshold * 0.5 else "MEDIUM",
                "description": "Unusual pattern detected in time series data",
                "anomaly_score": float(anomaly_score)
            })
        
        # Generate confidence interval
        confidence_interval = {
            "lower": max(0, anomaly_score - 0.1),
            "upper": min(1, anomaly_score + 0.1)
        }
        
        return AnomalyResponse(
            asset_id=request.asset_id,
            anomalies_detected=anomalies_detected,
            anomaly_score=float(anomaly_score),
            confidence_interval=confidence_interval,
            model_version=model_manager.model_versions["anomaly"],
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error in anomaly detection endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/metrics", response_model=MetricsResponse)
async def get_metrics():
    """Get service metrics and model performance"""
    try:
        # Get basic metrics from Redis
        total_requests = redis_client.get("total_requests") or 0
        successful_requests = redis_client.get("successful_requests") or 0
        failed_requests = redis_client.get("failed_requests") or 0
        
        # Calculate average response time
        response_times = redis_client.lrange("response_times", 0, -1)
        if response_times:
            avg_response_time = sum(float(rt) for rt in response_times) / len(response_times)
        else:
            avg_response_time = 0.0
        
        # Mock model performance metrics
        model_performance = {
            "pricing": {
                "mae": 0.15,
                "rmse": 0.20,
                "r2": 0.85
            },
            "yield": {
                "mae": 0.12,
                "rmse": 0.18,
                "r2": 0.88
            },
            "risk": {
                "mae": 0.08,
                "rmse": 0.12,
                "r2": 0.92
            },
            "anomaly": {
                "precision": 0.85,
                "recall": 0.78,
                "f1_score": 0.81
            }
        }
        
        return MetricsResponse(
            total_requests=int(total_requests),
            successful_requests=int(successful_requests),
            failed_requests=int(failed_requests),
            average_response_time=avg_response_time,
            model_performance=model_performance,
            last_updated=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error in metrics endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/demo/generate_data")
async def generate_demo_data(asset_id: str = "demo-asset-001"):
    """Generate demo data for testing and demonstration"""
    try:
        # Generate mock data
        cashflows = generate_mock_cashflows(asset_id, 365)
        market_data = generate_mock_market_data(365)
        iot_data = generate_mock_iot_data(asset_id, 8760)
        utilization = generate_mock_utilization(asset_id, 365)
        
        # Store data in MinIO for persistence
        demo_data = {
            "asset_id": asset_id,
            "generated_at": datetime.now().isoformat(),
            "cashflows": [cf.dict() for cf in cashflows],
            "market_data": [md.dict() for md in market_data],
            "iot_data": [id.dict() for id in iot_data],
            "utilization": [u.dict() for u in utilization]
        }
        
        # Save to MinIO
        data_key = f"demo_data/{asset_id}/data.json"
        minio_client.put_object(
            MINIO_BUCKET,
            data_key,
            json.dumps(demo_data).encode(),
            length=len(json.dumps(demo_data))
        )
        
        return {
            "message": "Demo data generated successfully",
            "asset_id": asset_id,
            "data_key": data_key,
            "records_generated": {
                "cashflows": len(cashflows),
                "market_data": len(market_data),
                "iot_data": len(iot_data),
                "utilization": len(utilization)
            }
        }
        
    except Exception as e:
        logger.error(f"Error generating demo data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/retrain")
async def retrain_models(background_tasks: BackgroundTasks):
    """Trigger model retraining (runs in background)"""
    try:
        # Add retraining task to background
        background_tasks.add_task(retrain_models_task)
        
        return {
            "message": "Model retraining started",
            "status": "scheduled",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error scheduling model retraining: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def retrain_models_task():
    """Background task for model retraining"""
    try:
        logger.info("Starting model retraining...")
        
        # This would typically involve:
        # 1. Loading new training data
        # 2. Retraining models
        # 3. Evaluating performance
        # 4. Saving updated models
        
        # For now, just update model versions
        for model_name in model_manager.models:
            model_manager.model_versions[model_name] = f"v1.0.1-{datetime.now().strftime('%Y%m%d')}"
            model_manager.save_model_to_storage(model_name)
        
        logger.info("Model retraining completed")
        
    except Exception as e:
        logger.error(f"Error in model retraining: {e}")

# Middleware for metrics collection
@app.middleware("http")
async def metrics_middleware(request, call_next):
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Calculate response time
    response_time = time.time() - start_time
    
    # Store metrics in Redis
    try:
        redis_client.incr("total_requests")
        if response.status_code < 400:
            redis_client.incr("successful_requests")
        else:
            redis_client.incr("failed_requests")
        
        # Store response time (keep last 100)
        redis_client.lpush("response_times", response_time)
        redis_client.ltrim("response_times", 0, 99)
        
    except Exception as e:
        logger.warning(f"Could not store metrics: {e}")
    
    return response

if __name__ == "__main__":
    import time
    uvicorn.run(app, host="0.0.0.0", port=8000)
