-- AIMY Platform Database Initialization Script
-- This script sets up the initial database schema and seed data

-- Create the main database
CREATE DATABASE aimy_platform;
\c aimy_platform;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE asset_type AS ENUM (
    'real_estate',
    'infrastructure',
    'renewable_energy',
    'commodities',
    'intellectual_property',
    'art_collectibles',
    'private_equity',
    'debt_instruments',
    'other'
);

CREATE TYPE asset_status AS ENUM (
    'draft',
    'pending_review',
    'approved',
    'active',
    'suspended',
    'matured',
    'liquidated'
);

CREATE TYPE kyc_level AS ENUM (
    'basic',
    'enhanced',
    'premium'
);

CREATE TYPE compliance_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'under_review',
    'suspended'
);

CREATE TYPE token_status AS ENUM (
    'draft',
    'pending_registration',
    'registered',
    'active',
    'paused',
    'matured',
    'redeemed'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'refunded'
);

-- Create tables
CREATE TABLE issuers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(500) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    jurisdiction VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    website VARCHAR(255),
    compliance_officer_id UUID,
    status compliance_status DEFAULT 'pending',
    kyc_level kyc_level DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE investors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issuer_id UUID REFERENCES issuers(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    date_of_birth DATE,
    nationality VARCHAR(100),
    kyc_level kyc_level DEFAULT 'basic',
    compliance_status compliance_status DEFAULT 'pending',
    risk_profile VARCHAR(50) DEFAULT 'moderate',
    investment_limit DECIMAL(20, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issuer_id UUID NOT NULL REFERENCES issuers(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    asset_type asset_type NOT NULL,
    status asset_status DEFAULT 'draft',
    location TEXT,
    valuation DECIMAL(20, 8),
    valuation_currency VARCHAR(3) DEFAULT 'USD',
    valuation_date DATE,
    risk_score DECIMAL(5, 2),
    yield_rate DECIMAL(5, 4),
    maturity_date DATE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE security_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id),
    issuer_id UUID NOT NULL REFERENCES issuers(id),
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    total_supply DECIMAL(20, 8) NOT NULL,
    issued_supply DECIMAL(20, 8) DEFAULT 0,
    token_price DECIMAL(20, 8),
    token_price_currency VARCHAR(3) DEFAULT 'USD',
    status token_status DEFAULT 'draft',
    contract_address VARCHAR(42),
    blockchain_network VARCHAR(50),
    issuance_date DATE,
    maturity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investor_id UUID NOT NULL REFERENCES investors(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    total_value DECIMAL(20, 8) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    risk_score DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id),
    token_id UUID NOT NULL REFERENCES security_tokens(id),
    quantity DECIMAL(20, 8) NOT NULL,
    average_price DECIMAL(20, 8),
    current_value DECIMAL(20, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(portfolio_id, token_id)
);

CREATE TABLE compliance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'issuer', 'investor', 'asset', 'token'
    entity_id UUID NOT NULL,
    compliance_type VARCHAR(100) NOT NULL, -- 'kyc', 'aml', 'sanctions', 'risk_assessment'
    status compliance_status DEFAULT 'pending',
    details JSONB,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investor_id UUID NOT NULL REFERENCES investors(id),
    token_id UUID NOT NULL REFERENCES security_tokens(id),
    amount DECIMAL(20, 8) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_type VARCHAR(50) NOT NULL, -- 'purchase', 'dividend', 'redemption', 'fee'
    status payment_status DEFAULT 'pending',
    transaction_hash VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'issuer', 'investor', 'asset', 'token'
    entity_id UUID NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    hash VARCHAR(64),
    uploaded_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_valuations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id),
    model_id VARCHAR(100) NOT NULL,
    valuation DECIMAL(20, 8) NOT NULL,
    confidence_score DECIMAL(5, 4),
    risk_score DECIMAL(5, 2),
    yield_prediction DECIMAL(5, 4),
    input_data JSONB,
    output_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_assets_issuer_id ON assets(issuer_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_tokens_asset_id ON security_tokens(asset_id);
CREATE INDEX idx_tokens_issuer_id ON security_tokens(issuer_id);
CREATE INDEX idx_investors_issuer_id ON investors(issuer_id);
CREATE INDEX idx_portfolio_holdings_portfolio_id ON portfolio_holdings(portfolio_id);
CREATE INDEX idx_portfolio_holdings_token_id ON portfolio_holdings(token_id);
CREATE INDEX idx_compliance_entity ON compliance_records(entity_type, entity_id);
CREATE INDEX idx_payments_investor_id ON payments(investor_id);
CREATE INDEX idx_payments_token_id ON payments(token_id);
CREATE INDEX idx_ai_valuations_asset_id ON ai_valuations(asset_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_issuers_updated_at BEFORE UPDATE ON issuers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investors_updated_at BEFORE UPDATE ON investors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_security_tokens_updated_at BEFORE UPDATE ON security_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolio_holdings_updated_at BEFORE UPDATE ON portfolio_holdings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_records_updated_at BEFORE UPDATE ON compliance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO issuers (id, name, legal_name, registration_number, jurisdiction, address, contact_email, contact_phone, website, status, kyc_level) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'SolarTech Energy Corp', 'SolarTech Energy Corporation', 'STEC001', 'Delaware, USA', '123 Solar Street, San Francisco, CA 94105', 'contact@solartech.com', '+1-555-0123', 'https://solartech.com', 'approved', 'enhanced'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Green Infrastructure Fund', 'Green Infrastructure Fund LP', 'GIF002', 'Cayman Islands', '456 Green Avenue, Grand Cayman', 'info@greeninfra.com', '+1-555-0456', 'https://greeninfra.com', 'approved', 'premium');

INSERT INTO investors (id, issuer_id, name, email, phone, address, date_of_birth, nationality, kyc_level, compliance_status, risk_profile, investment_limit) VALUES
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'John Smith', 'john.smith@email.com', '+1-555-0789', '789 Investor Lane, New York, NY 10001', '1985-03-15', 'US', 'enhanced', 'approved', 'moderate', 1000000.00),
    ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Jane Doe', 'jane.doe@email.com', '+1-555-0124', '321 Portfolio Street, Los Angeles, CA 90210', '1990-07-22', 'US', 'premium', 'approved', 'aggressive', 5000000.00);

INSERT INTO assets (id, issuer_id, name, description, asset_type, status, location, valuation, valuation_currency, valuation_date, risk_score, yield_rate, maturity_date) VALUES
    ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Solar Farm Alpha', '50MW solar photovoltaic power plant with 25-year PPA', 'renewable_energy', 'approved', 'Desert Valley, California', 25000000.00, 'USD', '2024-01-15', 0.35, 0.085, '2049-01-15'),
    ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Wind Farm Beta', '100MW onshore wind farm with grid connection', 'renewable_energy', 'approved', 'Windy Plains, Texas', 45000000.00, 'USD', '2024-01-15', 0.42, 0.092, '2049-01-15');

INSERT INTO security_tokens (id, asset_id, issuer_id, name, symbol, total_supply, issued_supply, token_price, token_price_currency, status, blockchain_network, issuance_date, maturity_date) VALUES
    ('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'SolarTech Solar Farm Alpha Token', 'STSF', 25000000.00, 10000000.00, 1.00, 'USD', 'active', 'Ethereum', '2024-01-15', '2049-01-15'),
    ('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Green Infrastructure Wind Farm Beta Token', 'GIWF', 45000000.00, 20000000.00, 1.00, 'USD', 'active', 'Ethereum', '2024-01-15', '2049-01-15');

INSERT INTO portfolios (id, investor_id, name, description, total_value, currency, risk_score) VALUES
    ('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'John Smith Portfolio', 'Diversified renewable energy portfolio', 500000.00, 'USD', 0.35),
    ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 'Jane Doe Portfolio', 'High-growth renewable energy portfolio', 1500000.00, 'USD', 0.42);

INSERT INTO portfolio_holdings (id, portfolio_id, token_id, quantity, average_price, current_value) VALUES
    ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440007', 500000.00, 1.00, 500000.00),
    ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440007', 1000000.00, 1.00, 1000000.00),
    ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440008', 500000.00, 1.00, 500000.00);

INSERT INTO compliance_records (id, entity_type, entity_id, compliance_type, status, details, reviewed_by, reviewed_at) VALUES
    ('issuer', '550e8400-e29b-41d4-a716-446655440001', 'kyc', 'approved', '{"kyc_level": "enhanced", "documents_verified": true, "background_check": "passed"}', '550e8400-e29b-41d4-a716-446655440003', '2024-01-15 10:00:00+00'),
    ('investor', '550e8400-e29b-41d4-a716-446655440003', 'kyc', 'approved', '{"kyc_level": "enhanced", "identity_verified": true, "source_of_funds": "verified"}', '550e8400-e29b-41d4-a716-446655440003', '2024-01-15 11:00:00+00');

INSERT INTO ai_valuations (id, asset_id, model_id, valuation, confidence_score, risk_score, yield_prediction, input_data, output_data) VALUES
    ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', 'solar_valuation_v1', 25000000.00, 0.92, 0.35, 0.085, '{"solar_irradiance": 5.8, "capacity_factor": 0.25, "ppa_rate": 0.085}', '{"valuation_breakdown": {"equipment": 15000000, "land": 5000000, "construction": 5000000}, "risk_factors": ["weather", "regulatory"]}'),
    ('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440006', 'wind_valuation_v1', 45000000.00, 0.89, 0.42, 0.092, '{"wind_speed": 7.2, "capacity_factor": 0.32, "ppa_rate": 0.092}', '{"valuation_breakdown": {"turbines": 30000000, "land": 10000000, "grid_connection": 5000000}, "risk_factors": ["wind_patterns", "maintenance"]}');

-- Grant permissions (adjust as needed for your setup)
GRANT ALL PRIVILEGES ON DATABASE aimy_platform TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Create a view for portfolio summary
CREATE VIEW portfolio_summary AS
SELECT 
    p.id as portfolio_id,
    p.name as portfolio_name,
    i.name as investor_name,
    i.email as investor_email,
    p.total_value,
    p.currency,
    p.risk_score,
    COUNT(ph.id) as number_of_holdings,
    SUM(ph.current_value) as total_holdings_value
FROM portfolios p
JOIN investors i ON p.investor_id = i.id
LEFT JOIN portfolio_holdings ph ON p.id = ph.portfolio_id
GROUP BY p.id, p.name, i.name, i.email, p.total_value, p.currency, p.risk_score;

-- Create a view for asset performance
CREATE VIEW asset_performance AS
SELECT 
    a.id as asset_id,
    a.name as asset_name,
    a.asset_type,
    a.valuation,
    a.risk_score,
    a.yield_rate,
    st.total_supply,
    st.issued_supply,
    st.token_price,
    (st.issued_supply / st.total_supply) * 100 as tokenization_percentage
FROM assets a
JOIN security_tokens st ON a.id = st.asset_id
WHERE a.status = 'approved' AND st.status = 'active';

COMMIT;
