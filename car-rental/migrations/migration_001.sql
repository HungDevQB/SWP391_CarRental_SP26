-- ============================================================
-- Migration 001 — registration_requests redesign + car fixes
-- Branch: feature/stripe-email-otp-fixes
-- Date:   2026-03-22
-- Apply:  Run on top of CarRentalDB.sql (fresh DB) OR existing DB
-- ============================================================

-- ── 1. Xóa bảng registration_requests cũ ────────────────────
-- Bảng cũ lưu KYC của user đã có tài khoản
-- Bảng mới lưu đăng ký mới (chưa có account)

IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_NAME = 'registration_requests'
)
BEGIN
    -- Xóa trigger trước
    IF EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'trigger_registration_requests_updated_at')
        DROP TRIGGER trigger_registration_requests_updated_at;

    DROP TABLE registration_requests;
    PRINT 'Dropped old registration_requests table.';
END
GO

-- ── 2. Tạo bảng registration_requests mới ───────────────────

CREATE TABLE registration_requests (
    id               INT PRIMARY KEY IDENTITY(1,1),
    full_name        NVARCHAR(255),
    id_number        VARCHAR(50),
    address          NVARCHAR(255),
    phone_number     VARCHAR(20),
    email            VARCHAR(255),
    password         VARCHAR(255) NULL,
    car_documents    VARCHAR(255),   -- URL/path file
    business_license VARCHAR(255),   -- URL/path file
    driver_license   VARCHAR(255),   -- URL/path file
    status           VARCHAR(50) DEFAULT 'pending',  -- pending / approved / rejected
    created_at       DATETIME DEFAULT GETDATE(),
    updated_at       DATETIME DEFAULT GETDATE()
);
GO

PRINT 'Created new registration_requests table.';
GO

-- Trigger tự cập nhật updated_at
CREATE TRIGGER trigger_registration_requests_updated_at
ON registration_requests
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE registration_requests
    SET updated_at = GETDATE()
    FROM registration_requests r
    INNER JOIN inserted i ON r.id = i.id;
END;
GO

PRINT 'Created trigger trigger_registration_requests_updated_at.';
GO

-- ── 3. Thêm cột color vào bảng cars (nếu chưa có) ───────────
-- Bảng cars đã có cột color trong CarRentalDB.sql (dòng 197)
-- Script này chỉ cần chạy nếu DB được tạo từ schema cũ hơn

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'cars' AND COLUMN_NAME = 'color'
)
BEGIN
    ALTER TABLE cars ADD color NVARCHAR(20) NULL;
    PRINT 'Added column color to cars table.';
END
ELSE
    PRINT 'Column color already exists in cars table — skipped.';
GO

-- ── 4. Kiểm tra Status ID=1 là "pending" ────────────────────
-- Xe tạo mới sẽ có status_id = 1 (pending, chờ admin duyệt)
-- Trước đây dùng status_id = 11 (available) — đã sửa trong CarService.cs

DECLARE @pendingName NVARCHAR(50);
SELECT @pendingName = status_name FROM Status WHERE status_id = 1;

IF @pendingName = 'pending'
    PRINT 'Status ID=1 is "pending" — OK.';
ELSE
    PRINT 'WARNING: Status ID=1 is "' + ISNULL(@pendingName, 'NULL') + '", expected "pending". Check Status table!';
GO

-- ── 5. Xóa FK và navigation RegistrationRequests khỏi Users ─
-- Đã xử lý ở tầng code (User.cs, ApplicationDbContext.cs)
-- Không cần thay đổi bảng users trong DB

PRINT '=== Migration 001 completed ===';
GO
