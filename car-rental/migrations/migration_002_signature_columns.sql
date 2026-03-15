-- Migration 002: Expand signature columns for base64 electronic signatures
-- Run this against CarRentalDB

-- Expand customer_signature to NVARCHAR(MAX) for base64 signature data
ALTER TABLE Contract ALTER COLUMN customer_signature NVARCHAR(MAX) NULL;

-- Expand supplier_signature to NVARCHAR(MAX) for base64 signature data
ALTER TABLE Contract ALTER COLUMN supplier_signature NVARCHAR(MAX) NULL;

PRINT 'Migration 002 completed: Signature columns expanded to NVARCHAR(MAX)';
