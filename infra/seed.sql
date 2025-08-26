-- AIMY Platform Seed Data Script
-- This script populates the database with demo data for development and testing

-- Insert demo issuer
INSERT INTO issuers (
    id, name, legal_name, registration_number, jurisdiction, address, 
    contact_email, contact_phone, website, status, kyc_level
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'SolarTech Ventures Ltd',
    'SolarTech Ventures Limited',
    'STV-2024-001',
    'Hong Kong',
    'Suite 2501, 25/F, Central Plaza, 18 Harbour Road, Wan Chai, Hong Kong',
    'contact@solartechventures.hk',
    '+852 2345 6789',
    'https://solartechventures.hk',
    'approved',
    'enhanced'
);

-- Insert KYC policy
INSERT INTO kyc_policies (
    id, issuer_id, name, description, requirements, risk_level, status
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'Enhanced KYC Policy',
    'Comprehensive KYC requirements for accredited and qualified investors',
    '{"identity_verification": true, "address_verification": true, "source_of_funds": true, "risk_assessment": true, "ongoing_monitoring": true}',
    'medium',
    'active'
);

-- Insert compliance officer
INSERT INTO compliance_officers (
    id, issuer_id, name, email, phone, certification, status
) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    'Sarah Chen',
    'compliance@solartechventures.hk',
    '+852 2345 6790',
    'Certified Anti-Money Laundering Specialist (CAMS)',
    'active'
);

-- Update issuer with compliance officer
UPDATE issuers 
SET compliance_officer_id = '550e8400-e29b-41d4-a716-446655440003'
WHERE id = '550e8400-e29b-41d4-a716-446655440001';

-- Insert solar farm asset
INSERT INTO assets (
    id, issuer_id, name, description, asset_type, total_value, 
    currency, location, status, metadata
) VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440001',
    'Solar Farm 3643',
    '50MW solar photovoltaic power plant in Guangdong Province, China',
    'renewable_energy',
    50000000.00,
    'USD',
    'Guangdong Province, China',
    'active',
    '{"capacity_mw": 50, "annual_output_mwh": 75000, "grid_connection": "China Southern Grid", "land_area_hectares": 120, "technology": "monocrystalline silicon", "expected_lifespan_years": 25}'
);

-- Insert yield schedule
INSERT INTO yield_schedules (
    id, asset_id, schedule_type, start_date, end_date, 
    yield_rate, payment_frequency, currency
) VALUES 
    ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'quarterly', '2024-01-01', '2026-12-31', 0.065, 'quarterly', 'USD'),
    ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004', 'quarterly', '2027-01-01', '2029-12-31', 0.070, 'quarterly', 'USD'),
    ('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'quarterly', '2030-01-01', '2032-12-31', 0.075, 'quarterly', 'USD');

-- Insert ERC-3643 token
INSERT INTO tokens (
    id, asset_id, name, symbol, total_supply, decimals, 
    token_standard, contract_address, status, metadata
) VALUES (
    '550e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440004',
    'SolarTech Ventures Security Token',
    'STV',
    1000000,
    18,
    'ERC-3643',
    '0x1234567890123456789012345678901234567890',
    'active',
    '{"compliance_module": "0xabcdef1234567890abcdef1234567890abcdef12", "transfer_restrictions": true, "kyc_required": true, "max_transfer_amount": 100000}'
);

-- Insert initial primary offering
INSERT INTO offerings (
    id, asset_id, name, description, offering_type, 
    total_amount, minimum_investment, maximum_investment,
    start_date, end_date, status
) VALUES (
    '550e8400-e29b-41d4-a716-446655440009',
    '550e8400-e29b-41d4-a716-446655440004',
    'Solar Farm 3643 Initial Offering',
    'Initial token offering for the Solar Farm 3643 project',
    'primary',
    50000000.00,
    10000.00,
    1000000.00,
    '2024-01-15',
    '2024-03-15',
    'active'
);

-- Insert offering terms
INSERT INTO offering_terms (
    id, offering_id, term_type, value, description
) VALUES 
    ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440009', 'lockup_period', '12', '12-month lockup period'),
    ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440009', 'kyc_requirement', 'enhanced', 'Enhanced KYC required'),
    ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440009', 'accreditation', 'required', 'US accredited investor status required');

-- Insert US accredited investor
INSERT INTO investors (
    id, issuer_id, name, email, phone, address, date_of_birth, 
    nationality, kyc_level, compliance_status, risk_profile, investment_limit
) VALUES (
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440001',
    'John Smith',
    'john.smith@email.com',
    '+1 555 123 4567',
    '123 Wall Street, New York, NY 10005, USA',
    '1980-05-15',
    'United States',
    'enhanced',
    'approved',
    'moderate',
    1000000.00
);

-- Insert HK qualified investor
INSERT INTO investors (
    id, issuer_id, name, email, phone, address, date_of_birth, 
    nationality, kyc_level, compliance_status, risk_profile, investment_limit
) VALUES (
    '550e8400-e29b-41d4-a716-446655440014',
    '550e8400-e29b-41d4-a716-446655440001',
    'Li Wei',
    'li.wei@email.hk',
    '+852 9876 5432',
    '456 Nathan Road, Tsim Sha Tsui, Kowloon, Hong Kong',
    '1985-08-22',
    'Hong Kong',
    'enhanced',
    'approved',
    'moderate',
    2000000.00
);

-- Insert KYC documents for US investor
INSERT INTO kyc_documents (
    id, investor_id, document_type, document_number, issuing_country, 
    issue_date, expiry_date, status, file_path
) VALUES 
    ('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440013', 'passport', 'US123456789', 'United States', '2015-01-01', '2025-01-01', 'verified', 'kyc/documents/us_investor_passport.pdf'),
    ('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440013', 'drivers_license', 'NY123456789', 'United States', '2018-03-15', '2028-03-15', 'verified', 'kyc/documents/us_investor_drivers_license.pdf'),
    ('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440013', 'accreditation_letter', 'ACC-2024-001', 'United States', '2024-01-01', '2025-01-01', 'verified', 'kyc/documents/us_investor_accreditation.pdf');

-- Insert KYC documents for HK investor
INSERT INTO kyc_documents (
    id, investor_id, document_type, document_number, issuing_country, 
    issue_date, expiry_date, status, file_path
) VALUES 
    ('550e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440014', 'hk_id_card', 'A1234567', 'Hong Kong', '2010-01-01', '2030-01-01', 'verified', 'kyc/documents/hk_investor_id_card.pdf'),
    ('550e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440014', 'passport', 'HK987654321', 'Hong Kong', '2012-06-01', '2027-06-01', 'verified', 'kyc/documents/hk_investor_passport.pdf'),
    ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440014', 'qualification_certificate', 'QUAL-2024-001', 'Hong Kong', '2024-01-01', '2025-01-01', 'verified', 'kyc/documents/hk_investor_qualification.pdf');

-- Insert KYC screening results
INSERT INTO screening_results (
    id, investor_id, screening_type, result, risk_score, 
    details, screening_date, next_review_date
) VALUES 
    ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440013', 'sanctions_check', 'clear', 0.1, 'No sanctions matches found', '2024-01-10', '2025-01-10'),
    ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440013', 'pep_check', 'clear', 0.0, 'No PEP matches found', '2024-01-10', '2025-01-10'),
    ('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440013', 'adverse_media', 'clear', 0.2, 'No adverse media found', '2024-01-10', '2025-01-10'),
    ('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440014', 'sanctions_check', 'clear', 0.1, 'No sanctions matches found', '2024-01-10', '2025-01-10'),
    ('550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440014', 'pep_check', 'clear', 0.0, 'No PEP matches found', '2024-01-10', '2025-01-10'),
    ('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440014', 'adverse_media', 'clear', 0.1, 'No adverse media found', '2024-01-10', '2025-01-10');

-- Insert investor wallets
INSERT INTO investor_wallets (
    id, investor_id, wallet_address, wallet_type, 
    blockchain_network, status, created_at
) VALUES 
    ('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440013', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 'ethereum', 'ethereum', 'active', '2024-01-10'),
    ('550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440014', '0x8ba1f109551bA432bdf5c3c2E3B1a5C8b1C2D3E4', 'ethereum', 'ethereum', 'active', '2024-01-10');

-- Insert compliance cases
INSERT INTO compliance_cases (
    id, investor_id, case_type, status, priority, 
    description, assigned_officer_id, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440029',
    '550e8400-e29b-41d4-a716-446655440013',
    'kyc_review',
    'completed',
    'medium',
    'Initial KYC review for US accredited investor',
    '550e8400-e29b-41d4-a716-446655440003',
    '2024-01-10'
);

-- Insert compliance case for HK investor
INSERT INTO compliance_cases (
    id, investor_id, case_type, status, priority, 
    description, assigned_officer_id, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440014',
    'kyc_review',
    'completed',
    'medium',
    'Initial KYC review for HK qualified investor',
    '550e8400-e29b-41d4-a716-446655440003',
    '2024-01-10'
);

-- Insert audit logs
INSERT INTO audit_logs (
    id, entity_type, entity_id, action, user_id, 
    details, ip_address, user_agent, created_at
) VALUES 
    ('550e8400-e29b-41d4-a716-446655440031', 'issuer', '550e8400-e29b-41d4-a716-446655440001', 'created', '550e8400-e29b-41d4-a716-446655440003', 'Issuer account created', '192.168.1.100', 'Mozilla/5.0', '2024-01-01'),
    ('550e8400-e29b-41d4-a716-446655440032', 'asset', '550e8400-e29b-41d4-a716-446655440004', 'created', '550e8400-e29b-41d4-a716-446655440003', 'Solar Farm 3643 asset created', '192.168.1.100', 'Mozilla/5.0', '2024-01-02'),
    ('550e8400-e29b-41d4-a716-446655440033', 'token', '550e8400-e29b-41d4-a716-446655440008', 'deployed', '550e8400-e29b-41d4-a716-446655440003', 'ERC-3643 token deployed to blockchain', '192.168.1.100', 'Mozilla/5.0', '2024-01-03'),
    ('550e8400-e29b-41d4-a716-446655440034', 'offering', '550e8400-e29b-41d4-a716-446655440009', 'launched', '550e8400-e29b-41d4-a716-446655440003', 'Initial offering launched', '192.168.1.100', 'Mozilla/5.0', '2024-01-15');

-- Insert market data for the asset
INSERT INTO market_data (
    id, asset_id, price, currency, volume_24h, 
    change_24h, market_cap, timestamp
) VALUES 
    ('550e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440004', 50.00, 'USD', 1000000.00, 0.05, 50000000.00, '2024-01-15 09:00:00+00'),
    ('550e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440004', 52.50, 'USD', 1200000.00, 0.05, 52500000.00, '2024-01-16 09:00:00+00'),
    ('550e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440004', 55.13, 'USD', 1500000.00, 0.05, 55125000.00, '2024-01-17 09:00:00+00');

-- Insert liquidity pool
INSERT INTO liquidity_pools (
    id, asset_id, pool_address, total_liquidity, 
    token_a_balance, token_b_balance, fee_rate, status
) VALUES (
    '550e8400-e29b-41d4-a716-446655440038',
    '550e8400-e29b-41d4-a716-446655440004',
    '0xPool1234567890123456789012345678901234567890',
    10000000.00,
    5000000.00,
    5000000.00,
    0.003,
    'active'
);

-- Insert sample trades
INSERT INTO trades (
    id, pool_id, trader_address, trade_type, 
    amount_in, amount_out, fee, timestamp
) VALUES 
    ('550e8400-e29b-41d4-a716-446655440039', '550e8400-e29b-41d4-a716-446655440038', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 'buy', 10000.00, 200.00, 30.00, '2024-01-15 10:00:00+00'),
    ('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440038', '0x8ba1f109551bA432bdf5c3c2E3B1a5C8b1C2D3E4', 'sell', 150.00, 7500.00, 22.50, '2024-01-15 11:00:00+00');

-- Insert settlement records
INSERT INTO settlements (
    id, investor_id, asset_id, amount, currency, 
    settlement_type, status, settlement_date
) VALUES (
    '550e8400-e29b-41d4-a716-446655440041',
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440004',
    100000.00,
    'USD',
    'primary_purchase',
    'completed',
    '2024-01-20'
);

-- Insert settlement for HK investor
INSERT INTO settlements (
    id, investor_id, asset_id, amount, currency, 
    settlement_type, status, settlement_date
) VALUES (
    '550e8400-e29b-41d4-a716-446655440042',
    '550e8400-e29b-41d4-a716-446655440014',
    '550e8400-e29b-41d4-a716-446655440004',
    200000.00,
    'USD',
    'primary_purchase',
    'completed',
    '2024-01-21'
);

-- Insert AI insights
INSERT INTO ai_insights (
    id, asset_id, insight_type, confidence_score, 
    description, metadata, created_at
) VALUES 
    ('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440004', 'yield_forecast', 0.85, 'Solar output expected to exceed projections by 5% due to favorable weather patterns', '{"forecast_period": "2024-Q2", "confidence_interval": [0.80, 0.90], "factors": ["weather_patterns", "panel_efficiency", "maintenance_schedule"]}', '2024-01-15 12:00:00+00'),
    ('550e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440004', 'risk_assessment', 0.92, 'Low risk profile maintained with strong operational metrics and regulatory compliance', '{"risk_factors": ["operational", "regulatory", "market"], "risk_score": 0.08, "mitigation_measures": ["insurance_coverage", "compliance_monitoring", "performance_tracking"]}', '2024-01-15 12:00:00+00');

-- Insert compliance rules
INSERT INTO compliance_rules (
    id, rule_name, rule_type, conditions, actions, 
    priority, status, created_at
) VALUES 
    ('550e8400-e29b-41d4-a716-446655440045', 'US Accredited Investor Check', 'kyc_verification', '{"country": "US", "accreditation_required": true}', '{"action": "verify_accreditation", "on_failure": "reject_application"}', 'high', 'active', '2024-01-01'),
    ('550e8400-e29b-41d4-a716-446655440046', 'HK Qualified Investor Check', 'kyc_verification', '{"country": "HK", "qualification_required": true}', '{"action": "verify_qualification", "on_failure": "reject_application"}', 'high', 'active', '2024-01-01'),
    ('550e8400-e29b-41d4-a716-446655440047', 'Sanctions Screening', 'compliance_check', '{"screening_type": "sanctions", "databases": ["OFAC", "UN", "EU"]}', '{"action": "block_transaction", "on_match": "flag_for_review"}', 'critical', 'active', '2024-01-01');

-- Insert webhook endpoints
INSERT INTO webhook_endpoints (
    id, name, url, events, secret_key, 
    status, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440048',
    'Compliance Alerts',
    'https://webhook.site/aimy-compliance',
    '["kyc_completed", "compliance_violation", "screening_result"]',
    'webhook_secret_key_123',
    'active',
    '2024-01-01'
);

-- Insert sample webhook events
INSERT INTO webhook_events (
    id, endpoint_id, event_type, payload, 
    status, attempts, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440049',
    '550e8400-e29b-41d4-a716-446655440048',
    'kyc_completed',
    '{"investor_id": "550e8400-e29b-41d4-a716-446655440013", "status": "approved", "completion_date": "2024-01-10"}',
    'delivered',
    1,
    '2024-01-10 15:30:00+00'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_issuer_id ON assets(issuer_id);
CREATE INDEX IF NOT EXISTS idx_tokens_asset_id ON tokens(asset_id);
CREATE INDEX IF NOT EXISTS idx_offerings_asset_id ON offerings(asset_id);
CREATE INDEX IF NOT EXISTS idx_investors_issuer_id ON investors(issuer_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_investor_id ON kyc_documents(investor_id);
CREATE INDEX IF NOT EXISTS idx_screening_results_investor_id ON screening_results(investor_id);
CREATE INDEX IF NOT EXISTS idx_compliance_cases_investor_id ON compliance_cases(investor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_market_data_asset_id ON market_data(asset_id);
CREATE INDEX IF NOT EXISTS idx_trades_pool_id ON trades(pool_id);
CREATE INDEX IF NOT EXISTS idx_settlements_investor_id ON settlements(investor_id);

-- Insert sample reports
INSERT INTO reports (
    id, report_type, title, content, metadata, 
    generated_by, created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440050',
    'proof_of_reserve',
    'Proof of Reserve Report - 2024-01-15',
    '{"total_assets": 50000000, "total_liabilities": 0, "reserve_ratio": 1.0, "audit_date": "2024-01-15"}',
    '{"auditor": "Deloitte", "methodology": "blockchain_verification", "confidence_level": 0.99}',
    'system',
    '2024-01-15 23:59:59+00'
);

-- Commit all changes
COMMIT;

-- Display summary
SELECT 
    'Seed Data Summary' as summary,
    COUNT(*) as total_records
FROM (
    SELECT 'issuers' as table_name, COUNT(*) as count FROM issuers
    UNION ALL
    SELECT 'assets', COUNT(*) FROM assets
    UNION ALL
    SELECT 'tokens', COUNT(*) FROM tokens
    UNION ALL
    SELECT 'investors', COUNT(*) FROM investors
    UNION ALL
    SELECT 'offerings', COUNT(*) FROM offerings
    UNION ALL
    SELECT 'compliance_cases', COUNT(*) FROM compliance_cases
    UNION ALL
    SELECT 'kyc_documents', COUNT(*) FROM kyc_documents
    UNION ALL
    SELECT 'screening_results', COUNT(*) FROM screening_results
    UNION ALL
    SELECT 'audit_logs', COUNT(*) FROM audit_logs
    UNION ALL
    SELECT 'market_data', COUNT(*) FROM market_data
    UNION ALL
    SELECT 'trades', COUNT(*) FROM trades
    UNION ALL
    SELECT 'settlements', COUNT(*) FROM settlements
    UNION ALL
    SELECT 'ai_insights', COUNT(*) FROM ai_insights
    UNION ALL
    SELECT 'compliance_rules', COUNT(*) FROM compliance_rules
    UNION ALL
    SELECT 'webhook_endpoints', COUNT(*) FROM webhook_endpoints
    UNION ALL
    SELECT 'reports', COUNT(*) FROM reports
) as summary_data;
