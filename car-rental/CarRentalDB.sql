create database CarRentalDB
-- 1. Tạo bảng CountryCode
CREATE TABLE CountryCode (
    country_code VARCHAR(4) PRIMARY KEY CHECK (country_code LIKE '+[0-9]%'),
    country_name NVARCHAR(50) NOT NULL
);
GO
EXEC sys.sp_addextendedproperty 
    @name=N'MS_Description', 
    @value=N'Lưu trữ mã quốc gia cho số điện thoại', 
    @level0type=N'SCHEMA', @level0name=N'dbo', 
    @level1type=N'TABLE', @level1name=N'CountryCode';
GO

-- 2. Tạo bảng Language
CREATE TABLE Language (
    language_code VARCHAR(2) PRIMARY KEY,
    language_name NVARCHAR(50) NOT NULL,
    is_deleted BIT DEFAULT 0
);
GO

-- 3. Tạo bảng Role
CREATE TABLE Role (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_name VARCHAR(20) NOT NULL UNIQUE CHECK (role_name IN ('customer', 'supplier', 'admin')),
    description NVARCHAR(200),
    is_deleted BIT DEFAULT 0
);
GO
EXEC sys.sp_addextendedproperty 
    @name=N'MS_Description', 
    @value=N'Lưu trữ vai trò người dùng (khách hàng, nhà cung cấp, quản trị)', 
    @level0type=N'SCHEMA', @level0name=N'dbo', 
    @level1type=N'TABLE', @level1name=N'Role';
GO

-- 4. Tạo bảng Status
CREATE TABLE Status (
    status_id INT IDENTITY(1,1) PRIMARY KEY,
    status_name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(200),
    is_deleted BIT DEFAULT 0
);
GO
EXEC sys.sp_addextendedproperty 
    @name=N'MS_Description', 
    @value=N'Lưu trữ trạng thái cho các thực thể (đặt xe, xe, hợp đồng,...)', 
    @level0type=N'SCHEMA', @level0name=N'dbo', 
    @level1type=N'TABLE', @level1name=N'Status';
GO

-- 5. Tạo bảng Region
CREATE TABLE Region (
    region_id INT IDENTITY(1,1) PRIMARY KEY,
    region_name NVARCHAR(100) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    is_deleted BIT DEFAULT 0,
    country_code VARCHAR(4) NOT NULL,
    FOREIGN KEY (country_code) REFERENCES CountryCode(country_code)
);
GO
EXEC sys.sp_addextendedproperty 
    @name=N'MS_Description', 
    @value=N'Lưu trữ thông tin khu vực và tiền tệ', 
    @level0type=N'SCHEMA', @level0name=N'dbo', 
    @level1type=N'TABLE', @level1name=N'Region';
GO

-- 6. Tạo bảng Tax
CREATE TABLE Tax (
    tax_id INT IDENTITY(1,1) PRIMARY KEY,
    region_id INT NOT NULL,
    tax_name NVARCHAR(50) NOT NULL,
    tax_type VARCHAR(20) NOT NULL CHECK (tax_type IN ('percentage', 'fixed')),
    tax_rate DECIMAL(5, 2) NOT NULL CHECK (tax_rate >= 0),
    description NVARCHAR(200),
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (region_id) REFERENCES Region(region_id) ON DELETE CASCADE
);
GO

-- 7. Tạo bảng SystemConfiguration
CREATE TABLE SystemConfiguration (
    config_id INT IDENTITY(1,1) PRIMARY KEY,
    config_key NVARCHAR(50) NOT NULL UNIQUE,
    config_value NVARCHAR(255) NOT NULL,
    description NVARCHAR(200),
    is_deleted BIT DEFAULT 0
);
GO

-- 8. Tạo bảng [User]
CREATE TABLE [User] (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE CHECK (email LIKE '%@%.%'),
    phone VARCHAR(20) NOT NULL CHECK (phone NOT LIKE '%[^0-9+ ]%'),
    country_code VARCHAR(4) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    last_login DATETIME,
    status_id INT NOT NULL DEFAULT 1,
    preferred_language VARCHAR(2),
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (role_id) REFERENCES Role(role_id) ON DELETE NO ACTION,
    FOREIGN KEY (status_id) REFERENCES Status(status_id) ON DELETE NO ACTION,
    FOREIGN KEY (preferred_language) REFERENCES Language(language_code) ON DELETE SET NULL,
    FOREIGN KEY (country_code) REFERENCES CountryCode(country_code) ON DELETE NO ACTION
);
GO
CREATE TRIGGER UpdateUserTimestamp
ON [User]
AFTER UPDATE
AS
BEGIN
    UPDATE [User]
    SET updated_at = GETDATE()
    FROM [User] u
    INNER JOIN inserted i ON u.user_id = i.user_id;
END;
GO

-- 9. Tạo bảng UserDetail
CREATE TABLE UserDetail (
    user_id INT PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    address NVARCHAR(200) NOT NULL,
    taxcode VARCHAR(20),
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES [User](user_id) ON DELETE CASCADE
);
GO

-- 10. Tạo bảng FeeLevel
CREATE TABLE FeeLevel (
    feelevel_id INT IDENTITY(1,1) PRIMARY KEY,
    price DECIMAL(10, 2) NOT NULL,
    region_id INT NOT NULL,
    description NVARCHAR(200),
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (region_id) REFERENCES Region(region_id) ON DELETE NO ACTION
);
GO

-- 11. Tạo bảng ServiceType
CREATE TABLE ServiceType (
    servicetype_id INT IDENTITY(1,1) PRIMARY KEY,
    servicetype_name NVARCHAR(50) NOT NULL,
    is_deleted BIT DEFAULT 0
);
GO

-- 12. Tạo bảng SignUpToProvide
CREATE TABLE SignUpToProvide (
    signup_id INT IDENTITY(1,1) PRIMARY KEY,
    supplier_id INT NOT NULL,
    feelevel_id INT NOT NULL,
    servicetype_id INT NOT NULL,
    startdate DATE NOT NULL,
    finishdate DATE NOT NULL,
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (supplier_id) REFERENCES [User](user_id) ON DELETE CASCADE,
    FOREIGN KEY (feelevel_id) REFERENCES FeeLevel(feelevel_id) ON DELETE NO ACTION,
    FOREIGN KEY (servicetype_id) REFERENCES ServiceType(servicetype_id) ON DELETE NO ACTION,
    CONSTRAINT CHK_Dates CHECK (finishdate > startdate)
);
GO

-- 13. Tạo bảng FuelType
CREATE TABLE FuelType (
    fuel_type_id INT IDENTITY(1,1) PRIMARY KEY,
    fuel_type_name NVARCHAR(20) NOT NULL UNIQUE,
    description NVARCHAR(200),
    is_deleted BIT DEFAULT 0
);
GO

-- 14. Tạo bảng CarBrand
CREATE TABLE CarBrand (
    brand_id INT IDENTITY(1,1) PRIMARY KEY,
    brand_name NVARCHAR(50) NOT NULL UNIQUE,
    country NVARCHAR(50),
    is_deleted BIT DEFAULT 0
);
GO

-- Tạo bảng Car với thêm 2 cột transmission và describe
CREATE TABLE Car (
    car_id INT IDENTITY(1,1) PRIMARY KEY,
    supplier_id INT NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    model NVARCHAR(50) NOT NULL,
    year INT NOT NULL CHECK (year >= 1900),
    color NVARCHAR(20),
    status_id INT NOT NULL,
    num_of_seats TINYINT NOT NULL CHECK (num_of_seats > 0),
    daily_rate DECIMAL(10, 2) NOT NULL CHECK (daily_rate >= 0),
    region_id INT NOT NULL,
    brand_id INT NOT NULL,
    fuel_type_id INT NOT NULL,
    transmission NVARCHAR(20), -- Thêm cột transmission
    features NVARCHAR(500),
    describe NVARCHAR(500),    -- Thêm cột describe
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (supplier_id) REFERENCES [User](user_id) ON DELETE CASCADE,
    FOREIGN KEY (region_id) REFERENCES Region(region_id) ON DELETE NO ACTION,
    FOREIGN KEY (brand_id) REFERENCES CarBrand(brand_id) ON DELETE NO ACTION,
    FOREIGN KEY (status_id) REFERENCES Status(status_id) ON DELETE NO ACTION,
    FOREIGN KEY (fuel_type_id) REFERENCES FuelType(fuel_type_id) ON DELETE NO ACTION
);
CREATE INDEX idx_car_license_plate ON Car(license_plate);
CREATE INDEX idx_car_supplier_id ON Car(supplier_id);
CREATE INDEX idx_car_region_id ON Car(region_id);
GO
CREATE TRIGGER UpdateCarTimestamp
ON Car
AFTER UPDATE
AS
BEGIN
    UPDATE Car
    SET updated_at = GETDATE()
    FROM Car c
    INNER JOIN inserted i ON c.car_id = i.car_id;
END;
GO

-- 16. Tạo bảng Image
CREATE TABLE [Image] (
    image_id INT IDENTITY(1,1) PRIMARY KEY,
    car_id INT NOT NULL,
    image_url NVARCHAR(255) NOT NULL,
    description NVARCHAR(255),
    is_main BIT NOT NULL DEFAULT 0,
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (car_id) REFERENCES Car(car_id) ON DELETE CASCADE
);
GO

-- 17. Tạo bảng Driver
CREATE TABLE Driver (
    driver_id INT IDENTITY(1,1) PRIMARY KEY,
    supplier_id INT NOT NULL,
    driver_name NVARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    address NVARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL CHECK (phone NOT LIKE '%[^0-9+ ]%'),
    country_code VARCHAR(4) NOT NULL,
    license_number VARCHAR(20) NOT NULL UNIQUE,
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (supplier_id) REFERENCES [User](user_id) ON DELETE CASCADE,
    FOREIGN KEY (country_code) REFERENCES CountryCode(country_code) ON DELETE NO ACTION
);
GO
ALTER TABLE dbo.Driver
ADD 
    status_id INT,
    license_type VARCHAR(5),
    experience_years INT,
    license_expiry_date DATE;

-- 18. Tạo bảng Promotion
CREATE TABLE Promotion (
    promo_id INT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    discount_percentage DECIMAL(5, 2) NOT NULL CHECK (discount_percentage BETWEEN 0 AND 100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description NVARCHAR(200),
    is_deleted BIT DEFAULT 0,
    CONSTRAINT CHK_Promo_Dates CHECK (end_date > start_date)
);
GO

-- 19. Tạo bảng Booking
CREATE TABLE Booking (
    booking_id INT IDENTITY(1,1) PRIMARY KEY,
    customer_id INT NOT NULL,
    car_id INT NOT NULL,
    driver_id INT,
	with_driver BIT DEFAULT 0 NOT NULL,
    region_id INT NOT NULL,
    booking_date DATETIME NOT NULL DEFAULT GETDATE(),
    start_date DATETIME2 NOT NULL,
    end_date DATETIME2 NOT NULL,
    pickup_location NVARCHAR(200) NOT NULL,
    dropoff_location NVARCHAR(200) NOT NULL,
    status_id INT NOT NULL,
    seat_number TINYINT NOT NULL CHECK (seat_number > 0),
    deposit_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    promo_id INT,
	supplier_delivery_confirm BIT DEFAULT 0,
    customer_receive_confirm BIT DEFAULT 0,
    customer_return_confirm BIT DEFAULT 0,
    supplier_return_confirm BIT DEFAULT 0,
    delivery_confirm_time DATETIME,
    return_confirm_time DATETIME,
    extension_days INT DEFAULT 0 CHECK (extension_days >= 0),
    extension_status_id INT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES [User](user_id) ON DELETE NO ACTION,
    FOREIGN KEY (car_id) REFERENCES Car(car_id) ON DELETE NO ACTION,
    FOREIGN KEY (driver_id) REFERENCES Driver(driver_id) ON DELETE NO ACTION,
    FOREIGN KEY (region_id) REFERENCES Region(region_id) ON DELETE NO ACTION,
    FOREIGN KEY (status_id) REFERENCES Status(status_id) ON DELETE NO ACTION,
    FOREIGN KEY (promo_id) REFERENCES Promotion(promo_id) ON DELETE SET NULL,
    FOREIGN KEY (extension_status_id) REFERENCES Status(status_id) ON DELETE SET NULL,
    CONSTRAINT CHK_Booking_Dates CHECK (end_date > start_date),
    CONSTRAINT CHK_Start_Date CHECK (start_date >= CAST(booking_date AS DATE))
);
CREATE INDEX idx_booking_car_id ON Booking(car_id);
CREATE INDEX idx_booking_customer_id ON Booking(customer_id);
CREATE INDEX idx_booking_region_id ON Booking(region_id);
CREATE INDEX idx_booking_dates ON Booking(start_date, end_date);
CREATE INDEX idx_booking_promo_id ON Booking(promo_id);
GO
CREATE TRIGGER UpdateBookingTimestamp
ON Booking
AFTER UPDATE
AS
BEGIN
    UPDATE Booking
    SET updated_at = GETDATE()
    FROM Booking b
    INNER JOIN inserted i ON b.booking_id = i.booking_id;
END;
GO

-- 20. Tạo bảng BookingFinancials
CREATE TABLE BookingFinancials (
    booking_id INT PRIMARY KEY,
    total_fare DECIMAL(10, 2) NOT NULL CHECK (total_fare >= 0),
    applied_discount DECIMAL(10, 2) DEFAULT 0 CHECK (applied_discount >= 0),
    late_fee_amount DECIMAL(10, 2) DEFAULT 0 CHECK (late_fee_amount >= 0),
    late_days INT DEFAULT 0 CHECK (late_days >= 0),
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id) ON DELETE CASCADE
);
GO

-- 21. Tạo bảng BookingTax
CREATE TABLE BookingTax (
    booking_tax_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    tax_id INT NOT NULL,
    tax_amount DECIMAL(10, 2) NOT NULL CHECK (tax_amount >= 0),
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (tax_id) REFERENCES Tax(tax_id) ON DELETE NO ACTION,
    CONSTRAINT UQ_Booking_Tax UNIQUE (booking_id, tax_id)
);
GO

-- 22. Tạo bảng Deposit
CREATE TABLE Deposit (
    deposit_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    region_id INT NOT NULL,
    deposit_date DATETIME NOT NULL DEFAULT GETDATE(),
    status_id INT NOT NULL,
    refund_amount DECIMAL(10, 2),
    refund_date DATETIME,
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES Status(status_id) ON DELETE NO ACTION,
    FOREIGN KEY (region_id) REFERENCES Region(region_id) ON DELETE NO ACTION,
    CONSTRAINT UQ_Booking_Deposit UNIQUE (booking_id)
);
GO

-- 23. Tạo bảng Rating
CREATE TABLE Rating (
    rating_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    customer_id INT NOT NULL,
    rating_score TINYINT NOT NULL CHECK (rating_score BETWEEN 1 AND 5),
    comment NVARCHAR(500),
    rating_date DATETIME NOT NULL DEFAULT GETDATE(),
    car_id INT NOT NULL,
	is_anonymous BIT NOT NULL DEFAULT 0,
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES [User](user_id) ON DELETE NO ACTION,
    FOREIGN KEY (car_id) REFERENCES Car(car_id) ON DELETE NO ACTION,
    CONSTRAINT UQ_Booking_Rating UNIQUE (booking_id)
);
GO

-- 24. Tạo bảng Payment
CREATE TABLE Payment (
    payment_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    region_id INT NOT NULL,
    transaction_id VARCHAR(100),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('vnpay', 'cash', 'momo')),
    payment_status_id INT NOT NULL,
    payment_date DATETIME NOT NULL DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    payment_type VARCHAR(20) NOT NULL DEFAULT 'deposit' CHECK (payment_type IN ('deposit', 'full_payment', 'refund', 'payout')),
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (payment_status_id) REFERENCES Status(status_id) ON DELETE NO ACTION,
    FOREIGN KEY (region_id) REFERENCES Region(region_id) ON DELETE NO ACTION,
    CONSTRAINT UQ_Booking_Payment_Type UNIQUE (booking_id, payment_type)
);
GO

ALTER TABLE Payment 
ADD customer_cash_confirmed BIT DEFAULT 0,
    customer_cash_confirmed_at DATETIME NULL,
    supplier_cash_confirmed BIT DEFAULT 0,
    supplier_cash_confirmed_at DATETIME NULL;

-- Tạo index để tối ưu performance
CREATE INDEX idx_payments_cash_confirmation ON Payment(customer_cash_confirmed, supplier_cash_confirmed);
CREATE INDEX idx_payments_booking_method_type ON Payment(booking_id, payment_method, payment_type);

-- Thêm comment mô tả cho các fields mới (tùy chọn)
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Customer đã xác nhận thanh toán tiền mặt',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'Payment',
    @level2type = N'COLUMN', @level2name = N'customer_cash_confirmed';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Thời gian customer xác nhận thanh toán tiền mặt',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'Payment',
    @level2type = N'COLUMN', @level2name = N'customer_cash_confirmed_at';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Supplier đã xác nhận nhận tiền mặt',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'Payment',
    @level2type = N'COLUMN', @level2name = N'supplier_cash_confirmed';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Thời gian supplier xác nhận nhận tiền mặt',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'Payment',
    @level2type = N'COLUMN', @level2name = N'supplier_cash_confirmed_at';

-- 25. Tạo bảng Maintenance
CREATE TABLE Maintenance (
    maintenance_id INT IDENTITY(1,1) PRIMARY KEY,
    car_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description NVARCHAR(500),
    cost DECIMAL(10, 2) CHECK (cost >= 0),
    region_id INT,
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (car_id) REFERENCES Car(car_id) ON DELETE CASCADE,
    FOREIGN KEY (region_id) REFERENCES Region(region_id) ON DELETE SET NULL,
    CONSTRAINT CHK_Maintenance_Dates CHECK (end_date >= start_date)
);
GO
ALTER TABLE dbo.Maintenance
ADD 
    maintenance_type NVARCHAR(100),
    service_center NVARCHAR(200),
    status_id NVARCHAR(50),
    notes NVARCHAR(1000);
-- 26. Tạo bảng Insurance
CREATE TABLE Insurance (
    insurance_id INT IDENTITY(1,1) PRIMARY KEY,
    car_id INT NOT NULL,
    policy_number VARCHAR(50) NOT NULL UNIQUE,
    provider NVARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    coverage_details NVARCHAR(500),
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (car_id) REFERENCES Car(car_id) ON DELETE CASCADE,
    CONSTRAINT CHK_Insurance_Dates CHECK (end_date > start_date)
);
GO
ALTER TABLE dbo.Insurance
ADD 
    insurance_type NVARCHAR(100),
    premium DECIMAL(18, 2),  -- Chỉnh sửa độ chính xác nếu cần
    status_id NVARCHAR(50),
    notes NVARCHAR(1000);
-- 27. Tạo bảng Cancellation
CREATE TABLE Cancellation (
    cancellation_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    reason NVARCHAR(500),
    cancellation_date DATETIME NOT NULL DEFAULT GETDATE(),
    refund_amount DECIMAL(10, 2) CHECK (refund_amount >= 0),
    region_id INT,
    status_id INT NOT NULL,
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES Status(status_id) ON DELETE NO ACTION,
    FOREIGN KEY (region_id) REFERENCES Region(region_id) ON DELETE SET NULL,
    CONSTRAINT UQ_Booking_Cancellation UNIQUE (booking_id)
);
GO

-- 28. Tạo bảng Notification
CREATE TABLE Notification (
    notification_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    message NVARCHAR(500) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'in_app', 'chatbox')),
    status_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES [User](user_id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES Status(status_id) ON DELETE NO ACTION
);
GO

-- 29. Tạo bảng SupplierRevenue
CREATE TABLE SupplierRevenue (
    revenue_id INT IDENTITY(1,1) PRIMARY KEY,
    supplier_id INT NOT NULL,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    region_id INT NOT NULL,
    date DATETIME NOT NULL DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (supplier_id) REFERENCES [User](user_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (region_id) REFERENCES Region(region_id) ON DELETE NO ACTION
);
GO

-- 30. Tạo bảng UserActionLog
CREATE TABLE UserActionLog (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    action NVARCHAR(100) NOT NULL,
    timestamp DATETIME DEFAULT GETDATE(),
    details NVARCHAR(500),
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES [User](user_id) ON DELETE CASCADE
);
GO

-- 31. Tạo bảng ChatMessage
CREATE TABLE ChatMessage (
    message_id INT IDENTITY(1,1) PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    booking_id INT,
    message_content NVARCHAR(1000) NOT NULL,
    sent_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    is_read BIT DEFAULT 0,
    is_translated BIT DEFAULT 0,
    original_language VARCHAR(2),
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (sender_id) REFERENCES [User](user_id) ON DELETE NO ACTION,
    FOREIGN KEY (receiver_id) REFERENCES [User](user_id) ON DELETE NO ACTION,
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id) ON DELETE SET NULL,
    FOREIGN KEY (original_language) REFERENCES Language(language_code) ON DELETE SET NULL
);
CREATE INDEX idx_chatmessage_booking_id ON ChatMessage(booking_id);
CREATE INDEX idx_chatmessage_sent_at ON ChatMessage(sent_at);
CREATE INDEX idx_chatmessage_sender_receiver ON ChatMessage(sender_id, receiver_id);
CREATE INDEX idx_chatmessage_is_read ON ChatMessage(is_read) WHERE is_read = 0;
GO
EXEC sys.sp_addextendedproperty 
    @name=N'MS_Description', 
    @value=N'Lưu trữ lịch sử tin nhắn trong chatbox', 
    @level0type=N'SCHEMA', @level0name=N'dbo', 
    @level1type=N'TABLE', @level1name=N'ChatMessage';
GO

CREATE TABLE ChatMessageImage (
    image_id INT IDENTITY(1,1) PRIMARY KEY,
    message_id INT NOT NULL,
    image_url NVARCHAR(500) NOT NULL,
    FOREIGN KEY (message_id) REFERENCES ChatMessage(message_id) ON DELETE CASCADE
);
CREATE INDEX idx_chatmessageimage_message_id ON ChatMessageImage(message_id);

-- 32. Tạo bảng Contract
CREATE TABLE Contract (
    contract_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    contract_code VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    supplier_id INT NOT NULL,
    car_id INT NOT NULL,
    driver_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    terms_and_conditions NVARCHAR(4000),
    customer_signature VARCHAR(255),
    supplier_signature VARCHAR(255),
    contract_status_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES [User](user_id) ON DELETE NO ACTION,
    FOREIGN KEY (supplier_id) REFERENCES [User](user_id) ON DELETE NO ACTION,
    FOREIGN KEY (car_id) REFERENCES Car(car_id) ON DELETE NO ACTION,
    FOREIGN KEY (driver_id) REFERENCES Driver(driver_id) ON DELETE NO ACTION,
    FOREIGN KEY (contract_status_id) REFERENCES Status(status_id) ON DELETE NO ACTION
);
CREATE INDEX idx_contract_booking_id ON Contract(booking_id);
CREATE INDEX idx_contract_customer_id ON Contract(customer_id);
GO

-- 33. Tạo bảng Favorite
CREATE TABLE Favorite (
    favorite_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    car_id INT NULL,
    supplier_id INT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES [User](user_id),
    FOREIGN KEY (car_id) REFERENCES Car(car_id),
    FOREIGN KEY (supplier_id) REFERENCES [User](user_id)
);
GO

CREATE TABLE registration_requests (
    id INT PRIMARY KEY IDENTITY(1,1),
    full_name NVARCHAR(255),
    id_number VARCHAR(50),
    address NVARCHAR(255),
    phone_number VARCHAR(20),
    email VARCHAR(255),
	password VARCHAR(255) NOT NULL,
    car_documents VARCHAR(255), -- File path
    business_license VARCHAR(255),
    driver_license VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending/approved/rejected
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO
-- Create a trigger to update the updated_at column
CREATE TRIGGER trigger_registration_requests_updated_at
ON registration_requests
AFTER UPDATE
AS
BEGIN
    UPDATE registration_requests
    SET updated_at = GETDATE()
    FROM registration_requests r
    INNER JOIN inserted i ON r.id = i.id;
END;

CREATE TABLE user_sessions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    token NVARCHAR(512) NOT NULL,
    created_at DATETIME2 DEFAULT SYSDATETIME(),
    expired_at DATETIME2 NULL,
    is_active BIT DEFAULT 1,
    CONSTRAINT FK_user_sessions_user FOREIGN KEY (user_id) REFERENCES [User](user_id) ON DELETE CASCADE
);


-- Drop existing table if it exists (with all its constraints and triggers)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[cash_payment_confirmations]') AND type in (N'U'))
BEGIN
    -- Drop trigger first
    IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_cash_payment_confirmations_updated_at')
    BEGIN
        DROP TRIGGER tr_cash_payment_confirmations_updated_at;
        PRINT 'Dropped existing trigger tr_cash_payment_confirmations_updated_at';
    END
    
    -- Drop table
    DROP TABLE cash_payment_confirmations;
    PRINT 'Dropped existing cash_payment_confirmations table';
END
GO

-- Create the complete cash_payment_confirmations table
CREATE TABLE cash_payment_confirmations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    payment_id INT NOT NULL,
    supplier_id INT NOT NULL,
    amount_received DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VND',
    received_at DATETIME2 DEFAULT GETDATE(),
    confirmation_type VARCHAR(20) DEFAULT 'pickup',
    supplier_confirmation_code VARCHAR(50),
    is_confirmed BIT DEFAULT 0,
    notes VARCHAR(500),
    platform_fee DECIMAL(15,2) NOT NULL,
    platform_fee_status VARCHAR(20) DEFAULT 'pending',
    platform_fee_due_date DATETIME2,
    platform_fee_paid_at DATETIME2 NULL,
    platform_fee_payment_id INT NULL,
    overdue_penalty_rate DECIMAL(5,2) DEFAULT 0.05,
    penalty_amount DECIMAL(15,2) DEFAULT 0,
    total_amount_due DECIMAL(15,2) NULL,
    overdue_since DATETIME NULL,
    escalation_level INT DEFAULT 0,
    is_deleted BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT FK_cash_payment_confirmations_payment_id 
        FOREIGN KEY (payment_id) REFERENCES Payment(payment_id) ON DELETE CASCADE,
    CONSTRAINT FK_cash_payment_confirmations_supplier_id 
        FOREIGN KEY (supplier_id) REFERENCES [User](user_id) ON DELETE CASCADE
);
GO

-- Create indexes
CREATE INDEX idx_cash_payment_confirmations_payment_id ON cash_payment_confirmations(payment_id);
CREATE INDEX idx_cash_payment_confirmations_supplier_id ON cash_payment_confirmations(supplier_id);
CREATE INDEX idx_cash_payment_confirmations_platform_fee_status ON cash_payment_confirmations(platform_fee_status);
CREATE INDEX idx_cash_payment_confirmations_platform_fee_due_date ON cash_payment_confirmations(platform_fee_due_date);
CREATE INDEX idx_cash_payment_confirmations_is_confirmed ON cash_payment_confirmations(is_confirmed);
CREATE INDEX idx_cash_payment_confirmations_is_deleted ON cash_payment_confirmations(is_deleted);
GO

-- Create trigger for updated_at column
CREATE TRIGGER tr_cash_payment_confirmations_updated_at
ON cash_payment_confirmations
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE cash_payment_confirmations 
    SET updated_at = GETDATE()
    FROM cash_payment_confirmations cpc
    INNER JOIN inserted i ON cpc.id = i.id;
END;
GO

-- Add extended property for table description (SQL Server equivalent of COMMENT)
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Tracks cash payment confirmations and platform fee management for suppliers',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'cash_payment_confirmations';
GO

-- Show the table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'cash_payment_confirmations'
ORDER BY ORDINAL_POSITION;

PRINT 'Cash Payment Confirmations table created successfully with all required columns';

-- Tạo bảng BankAccount để lưu thông tin tài khoản ngân hàng của user
CREATE TABLE BankAccount (
    bank_account_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_holder_name NVARCHAR(100) NOT NULL,
    bank_name NVARCHAR(100) NOT NULL,
    bank_branch NVARCHAR(100),
    swift_code VARCHAR(20),
    routing_number VARCHAR(20),
    account_type VARCHAR(20) DEFAULT 'checking' CHECK (account_type IN ('checking', 'savings', 'business')),
    is_primary BIT DEFAULT 0,
    is_verified BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
 
    FOREIGN KEY (user_id) REFERENCES [User](user_id) ON DELETE CASCADE,
    CONSTRAINT UQ_User_Primary_Bank_Account UNIQUE (user_id, is_primary),
    CONSTRAINT UQ_Bank_Account_Number UNIQUE (account_number, bank_name)
);
GO

-- Tạo index để tối ưu truy vấn
CREATE INDEX idx_bank_account_user_id ON BankAccount(user_id);
CREATE INDEX idx_bank_account_is_primary ON BankAccount(is_primary);
CREATE INDEX idx_bank_account_is_verified ON BankAccount(is_verified);
CREATE INDEX idx_bank_account_is_deleted ON BankAccount(is_deleted);
GO

-- Tạo trigger để tự động cập nhật updated_at
CREATE TRIGGER UpdateBankAccountTimestamp
ON BankAccount
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE BankAccount
    SET updated_at = GETDATE()
    FROM BankAccount ba
    INNER JOIN inserted i ON ba.bank_account_id = i.bank_account_id;
END;
GO

-- Thêm mô tả cho bảng
EXEC sys.sp_addextendedproperty 
    @name=N'MS_Description', 
    @value=N'Lưu trữ thông tin tài khoản ngân hàng của người dùng cho việc thanh toán và nhận tiền', 
    @level0type=N'SCHEMA', @level0name=N'dbo', 
    @level1type=N'TABLE', @level1name=N'BankAccount';
GO

ALTER TABLE BankAccount DROP CONSTRAINT UQ_User_Primary_Bank_Account;
GO
-- Tạo constraint mới chỉ áp dụng khi is_primary = 1
CREATE UNIQUE INDEX UQ_User_Primary_Bank_Account 
ON BankAccount(user_id) 
WHERE is_primary = 1;
GO

-- Tạo bảng CarConditionReport để lưu báo cáo tình trạng xe
CREATE TABLE CarConditionReport (
    report_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL,
    car_id INT NOT NULL,
    reporter_id INT NOT NULL, -- ID của người báo cáo (customer hoặc supplier)
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('pickup', 'return')), -- pickup: nhận xe, return: trả xe
    report_date DATETIME NOT NULL DEFAULT GETDATE(),
    status_id INT NOT NULL DEFAULT 1, -- 1 là id của 'pending'

    -- Thông tin tình trạng xe
    fuel_level DECIMAL(5,2) CHECK (fuel_level BETWEEN 0 AND 100), -- Mức nhiên liệu (%)
    mileage INT, -- Số km đã đi
    exterior_condition NVARCHAR(20) DEFAULT N'good' CHECK (exterior_condition IN (N'excellent', N'good', N'fair', N'poor')),
    interior_condition NVARCHAR(20) DEFAULT N'good' CHECK (interior_condition IN (N'excellent', N'good', N'fair', N'poor')),
    engine_condition NVARCHAR(20) DEFAULT N'good' CHECK (engine_condition IN (N'excellent', N'good', N'fair', N'poor')),
    tire_condition NVARCHAR(20) DEFAULT N'good' CHECK (tire_condition IN (N'excellent', N'good', N'fair', N'poor')),
    
    -- Ghi chú chi tiết
    damage_notes NVARCHAR(1000), -- Ghi chú về hư hỏng
    additional_notes NVARCHAR(500), -- Ghi chú bổ sung
    
    -- Xác nhận
    is_confirmed BIT DEFAULT 0, -- Đã xác nhận bởi đối phương chưa
    confirmed_by INT, -- ID người xác nhận
    confirmed_at DATETIME, -- Thời gian xác nhận
    
    -- Metadata
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES Car(car_id) ON DELETE NO ACTION,
    FOREIGN KEY (reporter_id) REFERENCES [User](user_id) ON DELETE NO ACTION,
    FOREIGN KEY (confirmed_by) REFERENCES [User](user_id) ON DELETE SET NULL
);
GO

-- Tạo bảng CarConditionImage để lưu ảnh báo cáo tình trạng xe
CREATE TABLE CarConditionImage (
    image_id INT IDENTITY(1,1) PRIMARY KEY,
    report_id INT NOT NULL,
    image_url NVARCHAR(500) NOT NULL,
    image_type VARCHAR(50), -- 'exterior_front', 'exterior_back', 'interior_dashboard', 'damage_detail', etc.
    description NVARCHAR(255),
    upload_date DATETIME NOT NULL DEFAULT GETDATE(),
    is_deleted BIT DEFAULT 0,
    
    FOREIGN KEY (report_id) REFERENCES CarConditionReport(report_id) ON DELETE CASCADE
);
GO

-- Tạo index để tối ưu truy vấn
CREATE INDEX idx_car_condition_report_booking_id ON CarConditionReport(booking_id);
CREATE INDEX idx_car_condition_report_car_id ON CarConditionReport(car_id);
CREATE INDEX idx_car_condition_report_type ON CarConditionReport(report_type);
CREATE INDEX idx_car_condition_report_reporter_id ON CarConditionReport(reporter_id);
CREATE INDEX idx_car_condition_report_date ON CarConditionReport(report_date);
CREATE INDEX idx_car_condition_image_report_id ON CarConditionImage(report_id);
GO

-- Tạo trigger để tự động cập nhật updated_at
CREATE TRIGGER UpdateCarConditionReportTimestamp
ON CarConditionReport
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE CarConditionReport
    SET updated_at = GETDATE()
    FROM CarConditionReport ccr
    INNER JOIN inserted i ON ccr.report_id = i.report_id;
END;
GO

-- Thêm mô tả cho bảng
EXEC sys.sp_addextendedproperty 
    @name=N'MS_Description', 
    @value=N'Lưu trữ báo cáo tình trạng xe khi customer nhận và trả xe', 
    @level0type=N'SCHEMA', @level0name=N'dbo', 
    @level1type=N'TABLE', @level1name=N'CarConditionReport';
GO

EXEC sys.sp_addextendedproperty 
    @name=N'MS_Description', 
    @value=N'Lưu trữ ảnh báo cáo tình trạng xe', 
    @level0type=N'SCHEMA', @level0name=N'dbo', 
    @level1type=N'TABLE', @level1name=N'CarConditionImage';
GO

-- Tạo constraint để đảm bảo mỗi booking chỉ có 1 báo cáo pickup và 1 báo cáo return
CREATE UNIQUE INDEX UQ_CarConditionReport_Booking_Type 
ON CarConditionReport(booking_id, report_type) 
WHERE is_deleted = 0;
GO

CREATE TABLE PhoneOtp (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    phone NVARCHAR(32) NOT NULL,
    otp NVARCHAR(16) NOT NULL,
    createdAt DATETIME2 NOT NULL,
    verified BIT NOT NULL
);

-- INSERT dữ liệu
-- 1. Bảng Role
INSERT INTO Role (role_name, description)
VALUES 
    ('admin', N'Quản trị viên hệ thống'),
	('supplier', N'Nhà cung cấp xe'),
	('customer', N'Khách hàng thuê xe');
GO

-- 5. Bảng CountryCode (MỚI)
INSERT INTO CountryCode (country_code, country_name)
VALUES
    ('+84', N'Việt Nam'),
    ('+1', N'Hoa Kỳ'),
    ('+81', N'Nhật Bản'),
    ('+66', N'Thái Lan'),
    ('+65', N'Singapore'),
	('+33', N'Pháp'),
    ('+44', N'Anh'),
    ('+61', N'Úc'),
    ('+86', N'Trung Quốc'),
    ('+82', N'Hàn Quốc'),
    ('+91', N'Ấn Độ'),
    ('+60', N'Malaysia'),
    ('+62', N'Indonesia'),
    ('+63', N'Philippines'),
    ('+64', N'New Zealand'),
    ('+27', N'Nam Phi'),
    ('+55', N'Brazil'),
    ('+54', N'Argentina'),
    ('+52', N'Mexico'),
    ('+57', N'Colombia'),
    ('+58', N'Venezuela'),
    ('+20', N'Ai Cập'),
    ('+234', N'Nigeria'),
    ('+971', N'UAE'),
    ('+966', N'Ả Rập Saudi'),
    ('+90', N'Thổ Nhĩ Kỳ'),
    ('+98', N'Iran'),
    ('+92', N'Pakistan'),
    ('+880', N'Bangladesh'),
    ('+94', N'Sri Lanka'),
    ('+95', N'Myanmar'),
    ('+855', N'Campuchia'),
    ('+856', N'Lào'),
    ('+670', N'Timor-Leste'),
    ('+673', N'Brunei'),
    ('+975', N'Bhutan'),
    ('+960', N'Maldives'),
    ('+977', N'Nepal'),
    ('+992', N'Tajikistan'),
    ('+993', N'Turkmenistan'),
    ('+994', N'Azerbaijan'),
    ('+995', N'Georgia'),
    ('+996', N'Kyrgyzstan'),
    ('+998', N'Uzbekistan'),
    ('+968', N'Oman'),
    ('+974', N'Qatar'),
    ('+965', N'Kuwait'),
    ('+973', N'Bahrain'),
    ('+962', N'Jordan'),
    ('+961', N'Lebanon'),
    ('+964', N'Iraq')
GO
		

-- 2. Bảng Region
INSERT INTO Region (region_name, currency, country_code, is_deleted)
VALUES
    (N'Hà Nội', 'VND', '+84', 0),
    (N'Hồ Chí Minh', 'VND', '+84', 0),
    (N'Đà Nẵng', 'VND', '+84', 0),
    (N'Hải Phòng', 'VND', '+84', 0),
    (N'Cần Thơ', 'VND', '+84', 0),
    (N'Huế', 'VND', '+84', 0),
    (N'Nha Trang', 'VND', '+84', 0),
    (N'Vũng Tàu', 'VND', '+84', 0),
    (N'New York', 'USD', '+1', 0),         -- United States
    (N'Tokyo', 'JPY', '+81', 0),           -- Japan
    (N'Bangkok', 'THB', '+66', 0),         -- Thailand
    (N'Singapore', 'SGD', '+65', 0),       -- Singapore
    (N'London', 'GBP', '+44', 0),          -- United Kingdom
    (N'Sydney', 'AUD', '+61', 0),          -- Australia
    (N'Beijing', 'CNY', '+86', 0),         -- China
    (N'Seoul', 'KRW', '+82', 0),           -- South Korea
    (N'Delhi', 'INR', '+91', 0),           -- India
    (N'Kuala Lumpur', 'MYR', '+60', 0),    -- Malaysia
    (N'Jakarta', 'IDR', '+62', 0),         -- Indonesia
    (N'Manila', 'PHP', '+63', 0),          -- Philippines
    (N'Auckland', 'NZD', '+64', 0),        -- New Zealand
    (N'Johannesburg', 'ZAR', '+27', 0),    -- South Africa
    (N'São Paulo', 'BRL', '+55', 0),       -- Brazil
    (N'Buenos Aires', 'ARS', '+54', 0),    -- Argentina
    (N'Mexico City', 'MXN', '+52', 0),     -- Mexico
    (N'Bogotá', 'COP', '+57', 0),          -- Colombia
    (N'Caracas', 'VES', '+58', 0),         -- Venezuela
    (N'Cairo', 'EGP', '+20', 0),           -- Egypt
    (N'Lagos', 'NGN', '+234', 0),          -- Nigeria
    (N'Dubai', 'AED', '+971', 0),          -- United Arab Emirates
    (N'Riyadh', 'SAR', '+966', 0),         -- Saudi Arabia
    (N'Istanbul', 'TRY', '+90', 0),        -- Turkey
    (N'Tehran', 'IRR', '+98', 0),          -- Iran
    (N'Karachi', 'PKR', '+92', 0),         -- Pakistan
    (N'Dhaka', 'BDT', '+880', 0),          -- Bangladesh
    (N'Colombo', 'LKR', '+94', 0),         -- Sri Lanka
    (N'Yangon', 'MMK', '+95', 0),          -- Myanmar
    (N'Phnom Penh', 'KHR', '+855', 0),     -- Cambodia
    (N'Vientiane', 'LAK', '+856', 0),      -- Laos
    (N'Bandar Seri Begawan', 'BND', '+673', 0), -- Brunei
    (N'Thimbu', 'BTN', '+975', 0),         -- Bhutan
    (N'Malé', 'MVR', '+960', 0),           -- Maldives
    (N'Kathmandu', 'NPR', '+977', 0),      -- Nepal
    (N'Dushanbe', 'TJS', '+992', 0),       -- Tajikistan
    (N'Ashgabat', 'TMT', '+993', 0),       -- Turkmenistan
    (N'Baku', 'AZN', '+994', 0),           -- Azerbaijan
    (N'Tbilisi', 'GEL', '+995', 0),        -- Georgia
    (N'Bishkek', 'KGS', '+996', 0),        -- Kyrgyzstan
    (N'Tashkent', 'UZS', '+998', 0),       -- Uzbekistan
    (N'Muscat', 'OMR', '+968', 0),         -- Oman
    (N'Doha', 'QAR', '+974', 0),           -- Qatar
    (N'Kuwait City', 'KWD', '+965', 0),    -- Kuwait
    (N'Manama', 'BHD', '+973', 0),         -- Bahrain
    (N'Amman', 'JOD', '+962', 0),          -- Jordan
    (N'Beirut', 'LBP', '+961', 0),         -- Lebanon
    (N'Baghdad', 'IQD', '+964', 0),        -- Iraq
    (N'Paris', 'EUR', '+33', 0);           -- France
GO


-- 3. Bảng Status
INSERT INTO Status (status_name, description)
VALUES 
    (N'pending', N'Chờ xử lý'),
    (N'confirmed', N'Đã xác nhận'),
    (N'in progress', N'Đang thực hiện'),
    (N'completed', N'Hoàn thành'),
    (N'cancelled', N'Đã hủy'),
    (N'draft', N'Bản nháp'),
    (N'signed', N'Đã ký'),
    (N'active', N'Đang hiệu lực'),
    (N'expired', N'Hết hạn'),
    (N'terminated', N'Chấm dứt'),
    (N'available', N'Còn trống'),
    (N'rented', N'Đang được thuê'),
    (N'maintenance', N'Đang bảo dưỡng'),
    (N'out of service', N'Không hoạt động'),
    (N'paid', N'Đã thanh toán'),
    (N'failed', N'Thất bại'),
	(N'unavailable', N'Không khả dụng'),
    (N'refunded', N'Đã hoàn tiền'),
	('unread', N'Chưa đọc'),
	(N'blocked', N'Chặn'),
	(N'approved', N'Cho phép'),
	(N'rejected', N'bị từ chối'),
	(N'payout', N'Đã chuyển tiền'),
	(N'ready_for_pickup', N'chờ nhận xe'),
	(N'delivered', N'đã giao xe'),
	(N'disputed', N'Đang tranh chấp'),
    (N'resolved', N'Đã xử lý tranh chấp');
GO
INSERT INTO Status (status_name, description)
VALUES 
    -- Platform Fee Payment Status
    (N'processing', N'Đang xử lý thanh toán'),
    (N'overdue', N'Quá hạn'),
    
    -- Cash Payment Confirmation Status  
    (N'cash_confirmed', N'Đã xác nhận tiền mặt'),
    (N'cash_pending', N'Chờ xác nhận tiền mặt'),
    
    -- Booking Extended Status
    (N'returned', N'Đã trả xe'),
    (N'pickup_confirmed', N'Đã xác nhận nhận xe'),
    (N'return_confirmed', N'Đã xác nhận trả xe'),
    
    -- Payment Extended Status
    (N'partial_paid', N'Thanh toán một phần'),
    (N'full_paid', N'Thanh toán đầy đủ'),
    (N'refund_pending', N'Chờ hoàn tiền'),
    (N'refund_processing', N'Đang xử lý hoàn tiền'),
    
    -- Car Condition Report Status
    (N'damage_reported', N'Đã báo cáo hư hỏng'),
    (N'damage_confirmed', N'Xác nhận hư hỏng'),
    (N'repair_needed', N'Cần sửa chữa'),
    (N'repair_in_progress', N'Đang sửa chữa'),
    (N'repair_completed', N'Hoàn thành sửa chữa'),
    
    -- System Status
    (N'scheduled', N'Đã lên lịch'),
    (N'suspended', N'Tạm ngưng'),
    (N'archived', N'Đã lưu trữ'),
    
    -- User/Supplier Status
    (N'verified', N'Đã xác minh'),
    (N'unverified', N'Chưa xác minh'),
    (N'under_review', N'Đang xem xét'),
	(N'penalty_applied', N'Đã áp dụng phạt'),
    (N'escalated', N'Đã leo thang xử lý'),
    (N'suspended_due_to_overdue', N'Tạm ngưng do quá hạn');
GO

-- Update existing status descriptions for consistency
UPDATE Status SET description = N'Đang chờ xử lý' WHERE status_name = 'pending';
UPDATE Status SET description = N'Đang thực hiện' WHERE status_name = 'in_progress';
UPDATE Status SET description = N'Đã từ chối' WHERE status_name = 'rejected';
GO
-- 4. Bảng Language (SỬA: Thêm ngôn ngữ mới)
INSERT INTO Language (language_code, language_name)
VALUES 
    ('vi', N'Tiếng Việt'),
    ('en', N'Tiếng Anh'),
    ('ja', N'Tiếng Nhật'),
    ('zh', N'Tiếng Trung'),
    ('ko', N'Tiếng Hàn'),
    ('fr', N'Tiếng Pháp');
GO

-- 6. Bảng SystemConfiguration
INSERT INTO SystemConfiguration (config_key, config_value, description)
VALUES 
    ('LateFeeRate', '0.10', 'Phần trăm phí trễ tính trên giá thuê ngày'),
    ('MaxRentalDays', '30', 'Số ngày thuê tối đa cho một lần đặt');
GO

-- 7. Bảng Tax
INSERT INTO Tax (region_id, tax_name, tax_type, tax_rate, description)
VALUES 
    (1, N'VAT', 'percentage', 10.00, N'Thuế giá trị gia tăng Việt Nam'),
    (2, N'Sales Tax', 'percentage', 5.00, N'Thuế bán hàng Hoa Kỳ'),
    (3, N'Consumption Tax', 'percentage', 8.00, N'Thuế tiêu thụ Nhật Bản');
GO

--8. Bảng User
INSERT INTO [User] (
    username,
    password_hash,
    role_id,
    email,
    phone,
    country_code,
    status_id
)
VALUES
    -- 5 Admin (role_id = 1)
    ('NguyenVanHung', '$2a$10$sYTaoBh0Has/ztyhamhvkO4Ejy8B2SeU9MZmCvTlPJ9VbPy6cghZW', 1, 'nguyenvanhung@gmail.com', '+84912345678', '+84', 1),
    ('TranThiMai', '$2a$10$lFqyGYEcCiDFIiyz4aZ5seuh4nDbhTrcczMpz6v.rt6.4uDj4OKCe', 1, 'tranthimai@gmail.com', '+84987654321', '+84', 1),
    ('PhamQuocAnh', '$2a$10$YFMoUhbtnaDPD.1yjbo16ubOyDYcHLCqd26xFaLu2n7s/iv28I0d2', 1, 'phamquocanh@gmail.com', '+84933445566', '+84', 1),
    ('LeHongNgoc', '$2a$10$zwBnEKq82fLsqaQqI4kP5O9h6RkJPAsanEWBaAf9Rnc3t6pVhQniy', 1, 'lehongngoc@gmail.com', '+84909123456', '+84', 1),
    ('HoangMinhTuan', '$2a$10$fWYgCDLRNM4.RKHvpkTMVeS8Cjv1jV2P875fKHeJcWzQIG9hUwF2.', 1, 'hoangminhtuan@gmail.com', '+84977889900', '+84', 1),
    -- 5 Supplier (role_id = 2)
    ('NguyenThiLan', '$2a$10$F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1', 2, 'nguyenthilan@gmail.com', '+84911223344', '+84', 1),
    ('TranVanNam', '$2a$10$G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2', 2, 'tranvannam@gmail.com', '+84388776655', '+84', 1),
    ('PhamThiHoa', '$2a$10$H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3', 2, 'phamthihoa@gmail.com', '+84799665544', '+84', 1),
    ('LeMinhDuc', '$2a$10$I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4', 2, 'leminhduc@gmail.com', '+84933557799', '+84', 1),
    ('HoangThiThuy', '$2a$10$J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5', 2, 'hoangthithuy@gmail.com', '+84977112233', '+84', 1),
    ('NguyenVanBao', '$2a$10$wS2AZFgqJYEnGZoEzYrzXuPVAi43jhBx3Qb0GxhoqozE53Bh5Plpa', 2, 'nguyenvanbao@gmail.com', '+84911998877', '+84', 1),
    ('TranThiHuong', '$2a$10$1E97DCjEBAm3WhN5tlH34OcMFS0MyhiUunAt6L11gBQ3Ik081Ytmu', 2, 'tranthihuong@gmail.com', '+84388445566', '+84', 1),
    ('PhamVanLong', '$2a$10$aPWhmeaOGkFtEQetnIuWWeEn4pdxibxWsdAbLOpcPlJc4xC9Zi7H.', 2, 'phamvanlong@gmail.com', '+84799332211', '+84', 1),
    ('LeThiThu', '$2a$10$fGgOgrgZC4s.IcUgxTclheGE5Gvs266BREKnYg2oS3C6KN6iYCbn6', 2, 'lethithu@gmail.com', '+84933221100', '+84', 1),
    ('HoangVanPhuc', '$2a$10$YmILefcgaGe0G25VrT6g9usz1/NE9DAGjoLsPvQx.wcGxPKPY2N7G', 2, 'hoangvanphuc@gmail.com', '+84977554433', '+84', 1),
    ('NguyenThiNgoc', '$2a$10$CsHuRPDnlHABkcayJ/3Foeb8N4QJ/hfK4n760bYGFWZb5inSgshn.', 2, 'nguyenthingoc@gmail.com', '+84911887766', '+84', 1),
    ('TranVanKhoa', '$2a$10$Y42CNBdjDykJYnaX5erASOw1.woKXSZiQhSqdhGgaCQHKBxVQ2zVe', 2, 'tranvankhoa1@gmail.com', '+84388995544', '+84', 1),
    ('PhamThiYen', '$2a$10$flFToUSivZKIj0wgjNUwzuTasGrutGwBbZ4yoKtEhI5EYGyAX5hty', 2, 'phamthiyen@gmail.com', '+84799443322', '+84', 1),
    ('LeVanTam', '$2a$10$yPVrBEogPAabGEs7ZJ8Ud.doUqqU3yGacAJQwIGqLjLIuCAnNDXIu', 2, 'levantam@gmail.com', '+84933778899', '+84', 1),
    ('HoangThiLinh', '$2a$10$9W6VNZvu7seuOZeP9ovjNuxLZM1APGIcTTKiy4qLBqzgVNPOpvRN2', 2, 'hoangthilinh@gmail.com', '+84977223344', '+84', 1),
    ('NguyenVanDung', '$2a$10$IaR5oHUT8OlNQzGNGtu3HOxuUqURz9diTZB.iyfLPmtvurp8Vr8DK', 2, 'nguyenvandung@gmail.com', '+84911556677', '+84', 1),
    ('TranThiHa', '$2a$10$mjlFs3Ji5zPRMzh7uVU.kOdJIxi5qEyJVPvsNFWIYx17VgRXKMntK', 2, 'tranthiha@gmail.com', '+84388667788', '+84', 1),
    ('PhamVanHau', '$2a$10$V2RpQFSVQxmp53S3SBdaSuheJdGWNzhFupmsUxxqKMcOmT6KmOiSC', 2, 'phamvanhau@gmail.com', '+84799112233', '+84', 1),
    ('LeThiHong', '$2a$10$XmXnXWZjUmRCyXRBAYk1wejTUYtnShqb6h9mBXH/oNYdUbO5jLrR2', 2, 'lethihong@gmail.com', '+84933441122', '+84', 1),
    ('HoangVanTai', '$2a$10$nUTMjzmTUNiU12PJLErbd.SDeXhxoxC.aVt1knZIebzY6mxZIqT3C', 2, 'hoangvantai@gmail.com', '+84977885544', '+84', 1),
    ('NguyenThiMai1', '$2a$10$d4i9ZlOcsglT797W9FnbKe/w4lsAWR76aO1UuUtz/DSXxqN50aUBK', 2, 'nguyenthimai1@gmail.com', '+84911334455', '+84', 1),
    ('TranVanBinh', '$2a$10$fntCV9h0YtPcUwwfDx0TKOLowiTU/v7G4aeL04pLN/1l4OSD4xnj.', 2, 'tranvanbinh@gmail.com', '+84388223344', '+84', 1),
    ('PhamThiDung', '$2a$10$B2netPnMBmtDZISkiELXTu4RT3Qifc8yfe8fd/0PcrbkxW6vST5mq', 2, 'phamthidung@gmail.com', '+84799556677', '+84', 1),
    ('LeVanSon1', '$2a$10$olbbW3GiG/6Kexl0iLS3/ehApltN0V2LS2DRKgt4K/bYTDPGkDpJ.', 2, 'levanson1@gmail.com', '+84933667788', '+84', 1),
    ('HoangThiAnh', '$2a$10$GGn0MiDvZcYYEgfK0WTgt.qYRZvqh8HDdYO9m29UTi7AB.w2xOp9K', 2, 'hoangthianh@gmail.com', '+84977334455', '+84', 1),
    ('NguyenVanTuan', '$2a$10$RvvTLELVG7cZjvBzfBzXXeOpsbRTx7z8aIToz/hxJoNL6T9SR6DIO', 2, 'nguyenvantuan@gmail.com', '+84911778899', '+84', 1),
    ('TranThiLoan', '$2a$10$wHjtgJeBUZJpb0NrSQCrcubK/nbSu71YsNltXMkGGrKqnLZFbG6S.', 2, 'tranthiloan@gmail.com', '+84388466777', '+84', 1),
    ('PhamVanKien', '$2a$10$xjh.HyVXZFe7Ny7keLkjXOtiOurnv51yeTeMPMUgTEFAHnZxOZDxW', 2, 'phamvankien@gmail.com', '+84799223344', '+84', 1),
    ('LeThiHanh', '$2a$10$Jc.6Lr1JPhDDAq4fuWDZ1uZXZbSXnvyYsMzoIR0AEbHCJ3AGTHi1.', 2, 'lethihanh@gmail.com', '+84933558899', '+84', 1),
    ('NguyenThiBang', '$2a$10$NICr3iXb1C9OkmV2ln8mxuyCSqr8Sg6Yl2eW1Lt8M9gUQYa.h6Cy.', 2, 'nguyenthibang@gmail.com', '+84912667788', '+84', 1),
    ('TranVanChuong', '$2a$10$1QK2IiSgznufoxrd6D9GyuNiArYemX6eKiVJcXik6At9DmwCpXGz2', 2, 'tranvanchuong@gmail.com', '+84388112233', '+84', 1),
    ('PhamThiDiem', '$2a$10$8r.EYQ9d8Hriv6QS4/C3RumejXcZv1a8BuFC7cXa0WgPpDx3Yjbku', 2, 'phamthidiem@gmail.com', '+84799778899', '+84', 1),
    ('LeVanHoang', '$2a$10$KhsaUlC7zwtpPc2Of6EkH.WtXE0aT9.uJYK4y5iR6JoC7D8yN9GBW', 2, 'levanhoang@gmail.com', '+84933889900', '+84', 1),
    ('HoangThiKim', '$2a$10$T2sQV.KDCJL1EHspGoTiTuHiGAo3x4zYG0NqlR1BEjTEkEkQcCcVC', 2, 'hoangthikim@gmail.com', '+84977556677', '+84', 1),
    ('NguyenVanLoi', '$2a$10$zaFc7UyGBpgxGb.lPKuKUOjeROQmrVFufkFJDjJNrjg6MakTMkx5m', 2, 'nguyenvanloi@gmail.com', '+84911337788', '+84', 1),
    ('TranThiMy', '$2a$10$kie3ye7QgdM63WAxiOb7VOl7BcSr.nPctnc6SU30mKIQky5CKrUc6', 2, 'tranthimy1@gmail.com', '+84388665544', '+84', 1),
    ('PhamVanNghia', '$2a$10$UNYRvUJRiABLEYEvodz3se29P02p6GJwBobRGXfd0.gzL1w3d1t7m', 2, 'phamvannghia@gmail.com', '+84799446677', '+84', 1),
    ('LeThiPhuong', '$2a$10$SoEA26YpBF3RlokleerCmekETuTaEQRRBokinL6J/zBxLaphmD9Bi', 2, 'lethiphuong@gmail.com', '+84933774455', '+84', 1),
    ('HoangVanQuoc', '$2a$10$3NsosiwvkR0p7bAQM0fIRen1Dg8PqbIctaexTHVtpwE4lm6dsBOeG', 2, 'hoangvanquoc@gmail.com', '+84977228899', '+84', 1),
    ('NguyenThiAnh1', '$2a$10$HSUm.Ah7i0WHiKtvrlPVP.GXgya3DDTXy5qyw0xfX/.GU8YWohL8u', 2, 'nguyenthianh1@gmail.com', '+84912778899', '+84', 1),
    ('TranVanBac', '$2a$10$rwwtAgh.pyAi6fyROXSoreUCopwPZ0YwxwsDQl2hqtz7y8/LWumVq', 2, 'tranvanbac@gmail.com', '+84388224455', '+84', 1),
    ('PhamThiCuc', '$2a$10$TRhP5uDQdkfutKowzRR5/OWXuw.vfQbVPi.qacg291ij67UvjJdE6', 2, 'phamthicuc@gmail.com', '+84799551122', '+84', 1),
    ('LeVanDat', '$2a$10$ylHRgT4t6RXe5Xp0qClaTuwBxoKSnv93FPWhCpvxVC4K3eIR3Ehuu', 2, 'levandat@gmail.com', '+84933662233', '+84', 1),
    ('HoangThiGiang', '$2a$10$1RMTE8iBtuJf4PWyTNgkIOO.g/RnFv6I3QkO7RRlY7bB9gfScVi.6', 2, 'hoangthigiang@gmail.com', '+84977333344', '+84', 1),
    ('NguyenVanHao', '$2a$10$le3QTJvkuyK03VARC2Lyeu2zWeQi8Npxdu4i0W/l6iWcRs16gQVTC', 2, 'nguyenvanhao@gmail.com', '+84911445566', '+84', 1),
    ('TranThiHien', '$2a$10$xZ4r6hsNm/NKHHzZqI3Q.usqiojDMEztxDrx1CXWqFHIUSjfZDeQe', 2, 'tranthihien1@gmail.com', '+84387788999', '+84', 1),
    ('PhamVanKhoa1', '$2a$10$qMt3CTp8Q1UQGvA5jCAVRO3zZjpFVl5OhnOuUp69uPB6sc6DGbTNy', 2, 'phamvankhoa1@gmail.com', '+84799226677', '+84', 1),
    ('LeThiLien', '$2a$10$VYETviXrGcDHUUzCEWKRxODbUJ886XwsOmQNTtDV/R1ATNMiKSwOS', 2, 'lethilien@gmail.com', '+84933557788', '+84', 1),
    ('HoangVanMinh', '$2a$10$iNjcUOCWNq4bQ1VxnUg3r.GKPXgiIe5BPNyPjCka90rGYD2NnB3Wm', 2, 'hoangvanminh@gmail.com', '+84977448899', '+84', 1),
    ('NguyenThiNga', '$2a$10$mhfmh2pecmDoGIDMQQH29uFKVxv2/qG4Su85UKXpM5GOetcU6X97K', 2, 'nguyenthinga@gmail.com', '+84911886677', '+84', 1),
    ('TranVanPhat', '$2a$10$n1q/4jtOqyjF145M9fuRd.KvIt2OcscJHu0wNBmd3Ewy9Chum18E6', 2, 'tranvanphat1@gmail.com', '+84388667788', '+84', 1),
    ('PhamThiQuyen', '$2a$10$AJtlnV92Asztb8gMgyW2l.KT3Ee/fxUo6Ku33OtGTsIOwl2uapyYa', 2, 'phamthiquyen@gmail.com', '+84799119900', '+84', 1),
    ('LeVanSon2', '$2a$10$gjd7hjRKHc5Chz.8145/LunuCTnOJr9qhwRNPKRMBbPjbWZLNLEka', 2, 'levanson67@gmail.com', '+84933446677', '+84', 1),
    ('HoangThiThuy1', '$2a$10$LZCwpzUyeWa50ibsXzvMleOJeaMQ7bSWBqZtcb8TWAyAr0tythiG6', 2, 'hoangthithuy12@gmail.com', '+84977225566', '+84', 1),
    -- 64 Customer (role_id = 3)
    ('NguyenVanAn', '$2a$10$1DK8gZvFehwbhH4Ms3nfxOx04wtgIYjZ430ewPZwiH7mLwbb87hIq', 3, 'nguyenvanan@gmail.com', '+84912346789', '+84', 1),
    ('TranThiBich', '$2a$10$ByPV5uLRq0/o0hoiipVyJ.r3/MpY14RGEF6RDn7Apkg9i94kZqNK2', 3, 'tranthibich@gmail.com', '+84988776655', '+84', 1),
    ('PhamVanCuong', '$2a$10$BXFpCqN/1otFlctPLchJqOvTqiftOwvTKm25T7XI6crZk8gdw9uNu', 3, 'phamvancuong@gmail.com', '+84799445566', '+84', 1),
    ('LeThiDuyen', '$2a$10$vZcv2f3P3O8U0DAfM0MCiuyVzrhY0p10XAl2P0rFOTIXx6avS6dRG', 3, 'lethiduyen@gmail.com', '+84933223344', '+84', 1),
    ('HoangVanGiang', '$2a$10$NsgdLk7WtmWs1.LMnxlyXOOUYVhcCGzdquOv7PRnZQYXLFmlFq20la', 3, 'hoangvangiang@gmail.com', '+84977114455', '+84', 1),
    ('NguyenThiHien', '$2a$10$P9Re9nx8wo6Z6k4r6n1QleVM/Vu8Z7gTLmpkhxaewpvdw8oY0j0oe', 3, 'nguyenthihien@gmail.com', '+84911889900', '+84', 1),
    ('TranVanHoa', '$2a$10$oBbtyEfqNSAtrr9QWhSr8un1QjCx5/R99QOsxbn3xZU6/HL4Oxm3S', 3, 'tranvanhoa@gmail.com', '+84385566777', '+84', 1),
    ('PhamThiKim', '$2a$10$VmVcPbgA4A5toCKdqv1vneyFmxlWXSbmo4f8rFlb8ny88oJD37oXu', 3, 'phamthikim1@gmail.com', '+84799334455', '+84', 1),
    ('LeVanLoc', '$2a$10$XOCkZhroqWRdSFtZReAsheUVdOxUa/sW3Tu7HMgjmDfsC5I6LLNqq', 3, 'levanloc@gmail.com', '+84933668899', '+84', 1),
    ('HoangThiMinh', '$2a$10$8QZ9N7lYBhPwB1DXqdiDdu7fpUdn7bMFXwbzhK6dPHwrTbom6fMFO', 3, 'hoangthiminh@gmail.com', '+84977225566', '+84', 1),
    ('NguyenVanNguyen', '$2a$10$eSons8SBOqraONUrku/Rju18p1x4MSUzvCW9deEodlahe.7C37U16', 3, 'nguyenvannguyen@gmail.com', '+84911557788', '+84', 1),
    ('TranThiOanh', '$2a$10$aaFnGBzEfufCjpyX2fm69.kG8jFgLdYo64v.Hkr/EbakD8wnHzUzC', 3, 'tranthioanh@gmail.com', '+84988668899', '+84', 1),
    ('PhamVanPhat1', '$2a$10$rKJwt3EfTnGKEoXdPVmQPeYGTaNE3Crb2JG.sYEsZeP4cIdMoHsoi', 3, 'phamvanphat1@gmail.com', '+84799115566', '+84', 1),
    ('LeThiQuyen', '$2a$10$t3jGAvOFKsDvX7MRYMRiIu85N09lfEdiUsPvzkMIlIEOYhg4hSuXW', 3, 'lethiquyen@gmail.com', '+84933446677', '+84', 1),
    ('HoangVanSang', '$2a$10$BWHTIbnhQ9SnOiV67dHlAuVoGH1ADuXk31LTQ9t4qvuZx49jBR9C6', 3, 'hoangvansang@gmail.com', '+84977337788', '+84', 1),
    ('NguyenThiThanh', '$2a$10$qUkLZn51rhU/kYiP8M7cSeL7RSE2o6rQs.yF5sCXEpoWWRWSeHEOm', 3, 'nguyenthithanh@gmail.com', '+84911779900', '+84', 1),
    ('TranVanThang', '$2a$10$qXeIrHu00QREf2tRVY3UPe3VYDNvCjT9hqfG58lIZRSad4fUdMHH2', 3, 'tranvanthang@gmail.com', '+84384477888', '+84', 1),
    ('PhamThiUyen', '$2a$10$lHnF2DhWTpjURSWx1pGsNeftaKgHuvnoQTRQsU/tAyzqWbuK999QC', 3, 'phamthiuyen@gmail.com', '+84799226677', '+84', 1),
    ('LeVanViet', '$2a$10$eYskOb0sTfkaW2.oIEIOI.n0MS8kTcHJnYpQUTfB61pPZM/kaqTOS', 3, 'levanviet@gmail.com', '+84933559900', '+84', 1),
    ('HoangThiXuan', '$2a$10$ZczYWSUERHb9GR1Y1NwEqO5VNSZSvFHv0fHbYk3QilYhQ.1MuWXyC', 3, 'hoangthixuan@gmail.com', '+84977441122', '+84', 1),
    ('NguyenVanDuong', '$2a$10$fhJlIVdhQ4zdSeBDrUOzx.lWSZM9a0aX7T62vdVp.4EJFogorCC9y', 3, 'nguyenvanduong@gmail.com', '+84911335566', '+84', 1),
    ('TranThiHang', '$2a$10$BfbtWt8iRMxiMwwQAbU6OOOE3SjEWuk0kD428SZYD.H6L1j36uEEq', 3, 'tranthihang@gmail.com', '+84382266777', '+84', 2),
    ('PhamVanKhanh', '$2a$10$eoPjiFVyaHnRmRWXY4JUguf/2O4rAxokrm5phoWi/PPSHrHY4O48G', 3, 'phamvankhanh@gmail.com', '+84799557788', '+84', 1),
    ('LeThiLe', '$2a$10$VnLKn864zc/vmJA1qccBhuUExqtxdXdK389onQAhf.Tg0Jq4WuAby', 3, 'lethile@gmail.com', '+84933669900', '+84', 1),
    ('HoangVanManh', '$2a$10$m4I7oV07tBorPLKDD48QBuOamBIHYyFP.68h195y0peKd4Nv6ON.i', 3, 'hoangvanmanh@gmail.com', '+84977338899', '+84', 1),
	 ('NguyenThiNhung', '$2a$10$OT.YkvJO/CWDHwXE4N5zmu1cuAST6pXKLmpg.3r/cX0OIdDycLNyu', 3, 'nguyenthinhung@gmail.com', '+84911446677', '+84', 1),
    ('TranVanPhu', '$2a$10$ZVTXTL.Jz96Zkvw5C/owweqBzvGTgJaOxRWw6b7lrdxYI.TgaVNOS', 3, 'tranvanphu@gmail.com', '+84385577888', '+84', 1),
    ('PhamThiQuynh', '$2a$10$6F07XELEKZDzF/c3ckrEgOiPLW19.JwqVPfnTfnMiq0L1VW6UZzQe', 3, 'phamthiquynh@gmail.com', '+84793366777', '+84', 1),
    ('LeVanSy', '$2a$10$Y5GCq./0EdbVQUGdls0k2e5TF1WJikIxEdMGJmLKAIAx737iM4OB.qG', 3, 'levansy@gmail.com', '+84933447788', '+84', 1),
    ('HoangThiThao', '$2a$10$OnmZ9NGNz/7is/nKDXWQ9eD4b90bYKKPMAxN7ujOGDPwp61.Et1Qm', 3, 'hoangthithao@gmail.com', '+84977226677', '+84', 1),
    ('NguyenVanThinh', '$2a$10$RVizc4Etofyn.WDbcdWQfuS.1FYOkKy4Vq8dArxNK0WPXzOv/RzIS', 3, 'nguyenvanthinh@gmail.com', '+84911888899', '+84', 1),
    ('TranThiTram', '$2a$10$WJ5EXlkdR0VMuL4nw5ZHOuubVg8Qy8aqK5W/DXzpXHLOx7C5V6tiu', 3, 'tranthitram@gmail.com', '+84386699000', '+84', 1),
    ('PhamVanTrung', '$2a$10$Y.TADvPcdrLDkKtcvBU4lO8ezyu4jEJhqn8CHw/ku9br5a5Ijoxq.', 3, 'phamvantrung@gmail.com', '+84791177888', '+84', 1),
    ('LeThiVan', '$2a$10$z.OVNzJcqV9qTsmF8oHm7eaWq2mBywFrQbFjO5MVShdyq5sws/SWm', 3, 'lethivan@gmail.com', '+84933556677', '+84', 1),
    ('HoangVanVy', '$2a$10$V2Ql5WIrhyXgU/dJiI8.deeX7KcM1Zaq3RldREi4MeTVfHk8ySWc6', 3, 'hoangvanvy@gmail.com', '+84977447788', '+84', 1),
    ('NguyenThiYen1', '$2a$10$9o5mVp9dEpX1g6rQhk.M4.PNsNigvI7VcU5/FLhRdHuoX9JpJVUee', 3, 'nguyenthiyen1@gmail.com', '+84911338899', '+84', 1),
    ('TranVanAnh', '$2a$10$tHQVa7VmBPUNBCJpAYn/tuidr10HLZUHwkJqHv6h14Fs0HGgdphey', 3, 'tranvananh@gmail.com', '+8438227788', '+84', 1),
    ('PhamThiBinh', '$2a$10$F68fN4xkh67Dw7XnW60Rou8ZFSbNo7I9boVWFnO8CCoOTk9bYtURu', 3, 'phamthibinh@gmail.com', '+84795588999', '+84', 1),
    ('LeVanCanh', '$2a$10$Jl03Ee6Uw9trfJHB79utxuXiQSqRE1nHFifGdH/SYNlPpQ9xHmk7K', 3, 'levancanh@gmail.com', '+84933666677', '+84', 1),
    ('HoangThiDao', '$2a$10$jlzy8zvB/Vm6Cg1vxX2eXeqmxzGVc69zJkT6PRV1uN4rBEJyXHHpe', 3, 'hoangthidao@gmail.com', '+84977339900', '+84', 1),
    ('NguyenVanDong', '$2a$10$BBdCHAjNZRWIjk6MR6HkHO9GmgTEX7Xuvk8SoTlCjw2.BE.hkM9Wy', 3, 'nguyenvandong@gmail.com', '+84911447788', '+84', 1),
    ('TranThiGam', '$2a$10$.T7kURTIlsHAjLd4BW9aJeJ4sxDK8.6roY1pK6WmfeTJGxq.jPlob6', 3, 'tranthigam@gmail.com', '+84385588999', '+84', 1),
    ('PhamVanHieu', '$2a$10$2I4169H7osczyy1yXH0QX.T8nnAu0f/AfA7QQtlMOhoGN6YU0/uAq', 3, 'phamvanhieu@gmail.com', '+84793377888', '+84', 1),
    ('LeThiHuyen', '$2a$10$usP3HzHYgzDyFK5xpRV0NOsW4tnXELQ6LP4.IxHFpk5yEcW79OHpy', 3, 'lethihuyen@gmail.com', '+84933448899', '+84', 1),
    ('HoangVanKhang', '$2a$10$cymKwB32ye0GSAT8nCFX1uRixSZcYVTN4eD02X7Hz/gPkTZuoUrz6', 3, 'hoangvankhang@gmail.com', '+84977227788', '+84', 1),
    ('NguyenThiLam', '$2a$10$IuZScM7JyZ2uKfHMHCrHp.OMXcJ8c6.arTIVLvvs4VliRdGeywZ1a', 3, 'nguyenthilam@gmail.com', '+84911889900', '+84', 1),
    ('TranVanLap', '$2a$10$I7FlTLvhiSGQvEsLtvckreWzgH.5.BwbLU6QKnj2KjUCShZgM5VVK', 3, 'tranvanlap@gmail.com', '+84386666777', '+84', 1),
    ('PhamThiMy1', '$2a$10$N8G7iDYWmBmCnCquLbO33ueTu/Zu4vfbAuMp05GqHMWnbhTYwFGV6', 3, 'phamthimy1@gmail.com', '+84791188999', '+84', 1),
    ('LeVanNghia', '$2a$10$c2vQtUGkUdU.6uKtcM1MhOHwrfY1gQb/NXzktPJMFi9S47wmF7qa.', 3, 'levannghia@gmail.com', '+84933557788', '+84', 1),
    ('HoangThiNhi', '$2a$10$2iYbX4s8rBjSJhT5AZAqeeZJYvTlkXgnpmjTzx9t2qPean67SNgOK', 3, 'hoangthinhii@gmail.com', '+84977448899', '+84', 1),
    ('NguyenVanPhong', '$2a$10$7aEYBbRk9Dp7.SbYv2BDbu34Ijspky/gH4Q.5dNJJRVM9GAk3Ci1S', 3, 'nguyenvanphong@gmail.com', '+84911339900', '+84', 1),
    ('TranThiPhuong1', '$2a$10$cMuUpG2Pjk.GWQ3hwawHvuKptwNH/zq5/agdoP0hrbmMOH2hPtcIy', 3, 'tranthiphuong1@gmail.com', '+84382288999', '+84', 1),
    ('PhamVanQuang', '$2a$10$wPcrodd5.FDHDiYEHluoeOKP6yXhYsxEgGN4A9cfFT5HW0Yt4V0de', 3, 'phamvanquang@gmail.com', '+84795599000', '+84', 1),
    ('LeThiRang', '$2a$10$/20yaVJXWcL/0n7.W3.bHOhbRL/9qPt6bPYjTdYRcuF59iijFtcQa', 3, 'lethirang@gmail.com', '+84933667788', '+84', 1),
    ('HoangVanSinh', '$2a$10$ZPy97tP7N/W/GZ6QWNx2gObzFyw/0vFI55Yi1TmgkxyIkg53Y0j3i', 3, 'hoangvansinh@gmail.com', '+84977336677', '+84', 1),
    ('NguyenThiSuong', '$2a$10$eQStNlmt7569CwqATaP/BuQJgSZlK4Zu.rkTxdH0rRKGH1HxB1wZ.', 3, 'nguyenthisuong@gmail.com', '+84911448899', '+84', 1),
    ('TranVanTai1', '$2a$10$67Lbz2b/snTTud/zcqtRJektxyxZrLAJXNSL.vhMF1xmB8XXBbCZO', 3, 'tranvantai1@gmail.com', '+84385599000', '+84', 1),
    ('PhamThiTham', '$2a$10$rXaMyrEmsdQI4GS5oJAt5ut102yM2Hf/4Q6e0lfpdxJKxPhCL/yR.', 3, 'phamthitham@gmail.com', '+84793388999', '+84', 1),
    ('LeVanThien', '$2a$10$VClg7B30d7qRohtc/KRV6OcBe5UUq8UDG4PMMbbaRRaUdKY8S.wre', 3, 'levanthien@gmail.com', '+84933449900', '+84', 1),
    ('HoangThiThuan', '$2a$10$6LJ6/lPao/68wHRQZziHnuEg5WixCax.ipg9qY/BeqA4QP.rGUapa', 3, 'hoangthithuan@gmail.com', '+84977228899', '+84', 1),
    ('NguyenVanTien', '$2a$10$rdT.L6JzDPopUNiThO/QtuBswxdw6Aim./YWNpR5nxvciCSj4u2mO', 3, 'nguyenvantien@gmail.com', '+84911886677', '+84', 1),
    ('TranThiTrang', '$2a$10$P0E.gJvtsZBRuvVmWUeu3eeVnTXcmN719HeZkVHacxa9QBoJ5eENG', 3, 'tranthitrang@gmail.com', '+84386677888', '+84', 1),
    ('PhamVanTruong', '$2a$10$olULd6/BzfRLuRUTLP/lPON4APVWkRAwDIJ.YXiiwqTwnXXrpROHq', 3, 'phamvantruong@gmail.com', '+84791199000', '+84', 1),
    ('LeThiVen', '$2a$10$o3AaQKKYCIdSeXJnfqZVKuOOuxkRThUYar52fn3cJmM1NieaCRA8u', 3, 'lethiven@gmail.com', '+84933558899', '+84', 1),
    ('HoangVanVuong', '$2a$10$zxpnVQiAbeSFxo8IT6NWAe/RqhJo1/yoEE8goIFmZWxyYdfndZMHi', 3, 'hoangvanvuong@gmail.com', '+84977449900', '+84', 1);
	GO

UPDATE [User]
SET 
    status_id = 8
WHERE status_id = 1;
GO

--9. Bảng UserDetail
INSERT INTO UserDetail (
    user_id,
    name,
    address,
    taxcode,
    is_deleted
)
VALUES
    -- 5 Admin (user_id 1–5)
    (1, N'Nguyễn Văn Hùng', N'123 Đường Láng, Hà Nội', NULL, 0),
    (2, N'Trần Thị Mai', N'45 Nguyễn Huệ, TP.HCM', NULL, 0),
    (3, N'Phạm Quốc Anh', N'78 Trần Hưng Đạo, Đà Nẵng', NULL, 0),
    (4, N'Lê Hồng Ngọc', N'12 Lê Lợi, Hải Phòng', NULL, 0),
    (5, N'Hoàng Minh Tuấn', N'56 Phạm Văn Đồng, Cần Thơ', NULL, 0),
    -- 55 Supplier (user_id 6–60)
    (6, N'Nguyễn Thị Lan', N'89 Kim Mã, Hà Nội', NULL, 0),
    (7, N'Trần Văn Nam', N'34 Bùi Thị Xuân, TP.HCM', NULL, 0),
    (8, N'Phạm Thị Hoa', N'67 Nguyễn Trãi, Đà Nẵng', NULL, 0),
    (9, N'Lê Minh Đức', N'23 Hùng Vương, Huế', NULL, 0),
    (10, N'Hoàng Thị Thùy', N'45 Lê Đại Hành, Nha Trang', NULL, 0),
    (11, N'Nguyễn Văn Bảo', N'12 Trần Phú, Vũng Tàu', NULL, 0),
    (12, N'Trần Thị Hương', N'78 Lý Thường Kiệt, Hà Nội', NULL, 0),
    (13, N'Phạm Văn Long', N'56 Nguyễn Văn Cừ, TP.HCM', NULL, 0),
    (14, N'Lê Thị Thu', N'34 Quang Trung, Đà Nẵng', NULL, 0),
    (15, N'Hoàng Văn Phúc', N'89 Nguyễn Du, Hải Phòng', NULL, 0),
    (16, N'Nguyễn Thị Ngọc', N'23 Phạm Ngũ Lão, Cần Thơ', NULL, 0),
    (17, N'Trần Văn Khoa', N'45 Lê Lợi, Hà Nội', NULL, 0),
    (18, N'Phạm Thị Yến', N'67 Trần Hưng Đạo, TP.HCM', NULL, 0),
    (19, N'Lê Văn Tâm', N'12 Nguyễn Huệ, Đà Nẵng', NULL, 0),
    (20, N'Hoàng Thị Linh', N'78 Lý Tự Trọng, Huế', NULL, 0),
    (21, N'Nguyễn Văn Dũng', N'56 Hùng Vương, Nha Trang', NULL, 0),
    (22, N'Trần Thị Hà', N'34 Lê Đại Hành, Vũng Tàu', NULL, 0),
    (23, N'Phạm Văn Hậu', N'89 Trần Phú, Hà Nội', NULL, 0),
    (24, N'Lê Thị Hồng', N'23 Nguyễn Trãi, TP.HCM', NULL, 0),
    (25, N'Hoàng Văn Tài', N'45 Quang Trung, Đà Nẵng', NULL, 0),
    (26, N'Nguyễn Thị Mai', N'67 Lê Lợi, Hải Phòng', NULL, 0),
    (27, N'Trần Văn Bình', N'12 Phạm Văn Đồng, Cần Thơ', NULL, 0),
    (28, N'Phạm Thị Dung', N'78 Nguyễn Du, Hà Nội', NULL, 0),
    (29, N'Lê Văn Sơn', N'56 Lý Thường Kiệt, TP.HCM', NULL, 0),
    (30, N'Hoàng Thị Anh', N'34 Nguyễn Văn Cừ, Đà Nẵng', NULL, 0),
    (31, N'Nguyễn Văn Tuấn', N'89 Hùng Vương, Huế', NULL, 0),
    (32, N'Trần Thị Loan', N'23 Lê Đại Hành, Nha Trang', NULL, 0),
    (33, N'Phạm Văn Kiên', N'45 Trần Phú, Vũng Tàu', NULL, 0),
    (34, N'Lê Thị Hạnh', N'67 Nguyễn Trãi, Hà Nội', NULL, 0),
    (35, N'Nguyễn Thị Băng', N'12 Quang Trung, TP.HCM', NULL, 0),
    (36, N'Trần Văn Chương', N'78 Lý Tự Trọng, Đà Nẵng', NULL, 0),
    (37, N'Phạm Thị Diễm', N'56 Phạm Ngũ Lão, Hải Phòng', NULL, 0),
    (38, N'Lê Văn Hoàng', N'34 Lê Lợi, Cần Thơ', NULL, 0),
    (39, N'Hoàng Thị Kim', N'89 Nguyễn Huệ, Hà Nội', NULL, 0),
    (40, N'Nguyễn Văn Lợi', N'23 Trần Hưng Đạo, TP.HCM', NULL, 0),
    (41, N'Trần Thị Mỹ', N'45 Hùng Vương, Đà Nẵng', NULL, 0),
    (42, N'Phạm Văn Nghĩa', N'67 Lý Thường Kiệt, Huế', NULL, 0),
    (43, N'Lê Thị Phương', N'12 Nguyễn Du, Nha Trang', NULL, 0),
    (44, N'Hoàng Văn Quốc', N'78 Trần Phú, Vũng Tàu', NULL, 0),
    (45, N'Nguyễn Thị Ánh', N'56 Lê Đại Hành, Hà Nội', NULL, 0),
    (46, N'Trần Văn Bắc', N'34 Nguyễn Trãi, TP.HCM', NULL, 0),
    (47, N'Phạm Thị Cúc', N'89 Quang Trung, Đà Nẵng', NULL, 0),
    (48, N'Lê Văn Đạt', N'23 Lý Tự Trọng, Hải Phòng', NULL, 0),
    (49, N'Hoàng Thị Giang', N'45 Phạm Văn Đồng, Cần Thơ', NULL, 0),
    (50, N'Nguyễn Văn Hào', N'123 Nguyễn Trãi, Hà Nội', NULL, 0),
    (51, N'Trần Thị Hiền', N'456 Lý Thường Kiệt, TP.HCM', NULL, 0),
    (52, N'Phạm Văn Khoa', N'789 Nguyễn Huệ, Đà Nẵng', NULL, 0),
    (53, N'Lê Thị Liên', N'101 Trần Phú, Hải Phòng', NULL, 0),
    (54, N'Hoàng Văn Minh', N'202 Phạm Ngũ Lão, Cần Thơ', NULL, 0),
    (55, N'Nguyễn Thị Nga', N'303 Hùng Vương, Hà Nội', NULL, 0),
    (56, N'Trần Văn Phát', N'404 Lê Lợi, TP.HCM', NULL, 0),
    (57, N'Phạm Thị Quyền', N'505 Quang Trung, Đà Nẵng', NULL, 0),
    (58, N'Lê Văn Sơn', N'606 Nguyễn Du, Huế', NULL, 0),
    (59, N'Hoàng Thị Thùy', N'707 Trần Hưng Đạo, Nha Trang', NULL, 0),
    -- 64 Customer (user_id 61–124)
	(60, N'Nguyễn Văn An', N'12 Kim Mã, Hà Nội', NULL, 0),
    (61, N'Trần Thị Bích', N'78 Bùi Thị Xuân, TP.HCM', NULL, 0),
    (62, N'Phạm Văn Cường', N'56 Nguyễn Trãi, Đà Nẵng', NULL, 0),
    (63, N'Lê Thị Duyên', N'34 Hùng Vương, Huế', NULL, 0),
    (64, N'Hoàng Văn Giang', N'89 Lê Đại Hành, Nha Trang', NULL, 0),
    (65, N'Nguyễn Thị Hiền', N'23 Trần Phú, Vũng Tàu', NULL, 0),
    (66, N'Trần Văn Hòa', N'45 Lý Thường Kiệt, Hà Nội', NULL, 0),
    (67, N'Phạm Thị Kim', N'67 Nguyễn Văn Cừ, TP.HCM', NULL, 0),
    (68, N'Lê Văn Lộc', N'12 Quang Trung, Đà Nẵng', NULL, 0),
    (69, N'Hoàng Thị Minh', N'78 Nguyễn Du, Hải Phòng', NULL, 0),
    (70, N'Nguyễn Văn Nguyên', N'56 Phạm Ngũ Lão, Cần Thơ', NULL, 0),
    (71, N'Trần Thị Oanh', N'34 Lê Lợi, Hà Nội', NULL, 0),
    (72, N'Phạm Văn Phát', N'89 Trần Hưng Đạo, TP.HCM', NULL, 0),
    (73, N'Lê Thị Quyên', N'23 Hùng Vương, Đà Nẵng', NULL, 0),
    (74, N'Hoàng Văn Sang', N'45 Lý Tự Trọng, Huế', NULL, 0),
    (75, N'Nguyễn Thị Thanh', N'67 Lê Đại Hành, Nha Trang', NULL, 0),
    (76, N'Trần Văn Thắng', N'12 Trần Phú, Vũng Tàu', NULL, 0),
    (77, N'Phạm Thị Uyên', N'78 Nguyễn Trãi, Hà Nội', NULL, 0),
    (78, N'Lê Văn Việt', N'56 Quang Trung, TP.HCM', NULL, 0),
    (79, N'Hoàng Thị Xuân', N'34 Phạm Văn Đồng, Đà Nẵng', NULL, 0),
    (80, N'Nguyễn Văn Dương', N'89 Nguyễn Du, Hải Phòng', NULL, 0),
    (81, N'Trần Thị Hằng', N'23 Lê Lợi, Cần Thơ', NULL, 0),
    (82, N'Phạm Văn Khánh', N'45 Trần Hưng Đạo, Hà Nội', NULL, 0),
    (83, N'Lê Thị Lệ', N'67 Bùi Thị Xuân, TP.HCM', NULL, 0),
    (84, N'Hoàng Văn Mạnh', N'12 Nguyễn Trãi, Đà Nẵng', NULL, 0),
    (85, N'Nguyễn Thị Nhung', N'78 Hùng Vương, Huế', NULL, 0),
    (86, N'Trần Văn Phú', N'56 Lê Đại Hành, Nha Trang', NULL, 0),
    (87, N'Phạm Thị Quỳnh', N'34 Trần Phú, Vũng Tàu', NULL, 0),
    (88, N'Lê Văn Sỹ', N'89 Lý Thường Kiệt, Hà Nội', NULL, 0),
    (89, N'Hoàng Thị Thảo', N'23 Nguyễn Văn Cừ, TP.HCM', NULL, 0),
    (90, N'Nguyễn Văn Thịnh', N'45 Quang Trung, Đà Nẵng', NULL, 0),
    (91, N'Trần Thị Trâm', N'67 Nguyễn Du, Hải Phòng', NULL, 0),
    (92, N'Phạm Văn Trung', N'12 Phạm Ngũ Lão, Cần Thơ', NULL, 0),
    (93, N'Lê Thị Vân', N'78 Lê Lợi, Hà Nội', NULL, 0),
    (94, N'Hoàng Văn Vỹ', N'56 Trần Hưng Đạo, TP.HCM', NULL, 0),
    (95, N'Nguyễn Thị Yến', N'34 Hùng Vương, Đà Nẵng', NULL, 0),
    (96, N'Trần Văn Ánh', N'89 Lý Tự Trọng, Huế', NULL, 0),
    (97, N'Phạm Thị Bình', N'23 Lê Đại Hành, Nha Trang', NULL, 0),
    (98, N'Lê Văn Cảnh', N'45 Trần Phú, Vũng Tàu', NULL, 0),
    (99, N'Hoàng Thị Đào', N'67 Nguyễn Trãi, Hà Nội', NULL, 0),
    (100, N'Nguyễn Văn Đông', N'12 Quang Trung, TP.HCM', NULL, 0),
    (101, N'Trần Thị Gấm', N'78 Phạm Văn Đồng, Đà Nẵng', NULL, 0),
    (102, N'Phạm Văn Hiệu', N'56 Nguyễn Du, Hải Phòng', NULL, 0),
    (103, N'Lê Thị Huyền', N'34 Lê Lợi, Cần Thơ', NULL, 0),
    (104, N'Hoàng Văn Khang', N'89 Trần Hưng Đạo, Hà Nội', NULL, 0),
    (105, N'Nguyễn Thị Lâm', N'23 Bùi Thị Xuân, TP.HCM', NULL, 0),
    (106, N'Trần Văn Lập', N'45 Nguyễn Trãi, Đà Nẵng', NULL, 0),
    (107, N'Phạm Thị Mỹ', N'67 Hùng Vương, Huế', NULL, 0),
    (108, N'Lê Văn Nghĩa', N'12 Lê Đại Hành, Nha Trang', NULL, 0),
    (109, N'Hoàng Thị Nhi', N'78 Trần Phú, Vũng Tàu', NULL, 0),
    (110, N'Nguyễn Văn Phong', N'56 Lý Thường Kiệt, Hà Nội', NULL, 0),
    (111, N'Trần Thị Phương', N'34 Nguyễn Văn Cừ, TP.HCM', NULL, 0),
    (112, N'Phạm Văn Quang', N'89 Quang Trung, Đà Nẵng', NULL, 0),
    (113, N'Lê Thị Răng', N'23 Nguyễn Du, Hải Phòng', NULL, 0),
    (114, N'Hoàng Văn Sinh', N'45 Phạm Ngũ Lão, Cần Thơ', NULL, 0),
    (115, N'Nguyễn Thị Sương', N'Unknown Address', NULL, 0),
    (116, N'Trần Văn Tài', N'Unknown Address', NULL, 0),
    (117, N'Phạm Thị Thắm', N'Unknown Address', NULL, 0),
    (118, N'Lê Văn Thiên', N'Unknown Address', NULL, 0),
    (119, N'Hoàng Thị Thuần', N'Unknown Address', NULL, 0),
    (120, N'Nguyễn Văn Tiến', N'Unknown Address', NULL, 0),
    (121, N'Trần Thị Trang', N'Unknown Address', NULL, 0),
    (122, N'Phạm Văn Trường', N'Unknown Address', NULL, 0),
    (123, N'Lê Thị Vẹn', N'Unknown Address', NULL, 0),
    (124, N'Hoàng Văn Vương', N'Unknown Address', NULL, 0);
GO
-- 10. Bảng FeeLevel
INSERT INTO FeeLevel (price, region_id, description)
VALUES 
    (100000.00, 1, N'Mức phí cơ bản'), -- region_id = 1 cho VND
    (50.00, 2, N'Mức phí cao cấp'),   -- region_id = 2 cho USD
    (5000.00, 3, N'Mức phí tiêu chuẩn Nhật Bản'); -- region_id = 3 cho JPY
GO

-- 11. Bảng ServiceType
INSERT INTO ServiceType (servicetype_name)
VALUES 
    (N'Tự lái'),
    (N'Có tài xế'),
    (N'Thuê dài hạn');
GO

-- 12. Bảng SignUpToProvide
INSERT INTO SignUpToProvide (supplier_id, feelevel_id, servicetype_id, startdate, finishdate)
VALUES 
    (2, 1, 1, '2025-05-16', '2025-12-31'),
    (2, 2, 2, '2025-05-16', '2025-12-31'),
    (2, 3, 3, '2025-05-16', '2025-12-31');
GO

-- 13. Bảng FuelType
INSERT INTO FuelType (fuel_type_name, description)
VALUES 
    (N'Xăng', N'Nhiên liệu xăng'),
    (N'Điện', N'Xe điện'),
    (N'Diesel', N'Nhiên liệu diesel'),
    (N'Hybrid', N'Xe lai');
GO

-- 14. Bảng CarBrand
INSERT INTO CarBrand (brand_name, country)
VALUES 
    (N'VinFast', N'Việt Nam'),
    (N'Hyundai', N'Hàn Quốc'),
    (N'Suzuki', N'Nhật Bản'),
    (N'Mitsubishi', N'Nhật Bản'),
    (N'MG', N'Trung Quốc'),
    (N'Mercedes', N'Đức'),
    (N'Mazda', N'Nhật Bản'),
    (N'KIA', N'Hàn Quốc'),
	(N'Toyota', N'Nhật Bản'),
    (N'Ford', N'Hoa Kỳ'),
    (N'Honda', N'Nhật Bản');
GO

INSERT INTO [Car] 
(supplier_id, license_plate, model, year, color, status_id, num_of_seats, daily_rate, region_id, brand_id, fuel_type_id, transmission, features, describe, created_at, updated_at, is_deleted)
VALUES
		-- 1. VinFast VF8
		(6, N'30A-00001', N'VinFast VF8', 2022, N'Đen', 11, 5, 1200000.00, 1, 1, 2, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Màn hình cảm ứng, Camera 360, Điều hòa tự động, Cảm biến áp suất lốp, Đèn LED',
		N'VinFast VF8 2022 - SUV điện 5 chỗ, kiểu dáng hiện đại, trang bị an toàn và tiện nghi cao cấp.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 2. VinFast Lux SA 2.0
		(12, N'30A-00002', N'VinFast Lux SA 2.0', 2021, N'Đỏ', 11, 7, 1500000.00, 1, 1, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Màn hình DVD, Camera lùi, Ghế da, Đèn LED, Cửa sổ trời, Điều hòa tự động',
		N'SUV 7 chỗ, động cơ mạnh mẽ, tiện nghi hiện đại, phù hợp gia đình và du lịch.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 3. VinFast Lux A 2.0
		(17, N'30A-00003', N'VinFast Lux A 2.0', 2021, N'Trắng', 11, 5, 1300000.00, 1, 1, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Ghế chỉnh điện, Điều hòa tự động',
		N'Sedan 5 chỗ sang trọng, vận hành êm ái, trang bị tiện nghi cao cấp.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 4. Hyundai Venue
		(23, N'30A-00004', N'Hyundai Venue', 2024, N'Đỏ', 11, 5, 800000.00, 1, 2, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Đèn chiếu sáng tự động, Cruise Control',
		N'Hyundai Venue 2024 gầm cao nhỏ gọn, nhiều tính năng an toàn, phù hợp đô thị.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 5. Toyota Wigo
		(28, N'30A-00005', N'Toyota Wigo', 2023, N'Trắng', 11, 5, 500000.00, 1, 9, 1, N'Số sàn',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Chống bó cứng phanh (ABS)',
		N'Hatchback nhỏ gọn, bền bỉ, tiết kiệm, phù hợp đi phố.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 6. Toyota Vios
		(34, N'30A-00006', N'Toyota Vios', 2018, N'Bạc', 11, 5, 450000.00, 1, 9, 1, N'Số sàn',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình DVD, Điều hòa tự động',
		N'Sedan quốc dân, vận hành ổn định, tiết kiệm, bảo trì dễ dàng.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 7. Toyota Veloz
		(39, N'30A-00007', N'Toyota Veloz', 2022, N'Đỏ', 11, 7, 800000.00, 1, 9, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Điều hòa tự động, Ghế da',
		N'MPV 7 chỗ rộng rãi, hiện đại, phù hợp gia đình đông người.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 8. Toyota Corolla Cross
		(45, N'30A-00008', N'Toyota Corolla Cross', 2022, N'Xanh', 11, 5, 900000.00, 1, 9, 4, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera 360, Màn hình cảm ứng, Cửa sổ trời, Điều hòa tự động',
		N'SUV 5 chỗ, động cơ hybrid tiết kiệm nhiên liệu, công nghệ mới.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 9. Toyota Avanza
		(50, N'30A-00009', N'Toyota Avanza', 2023, N'Đen', 11, 7, 700000.00, 1, 9, 1, N'Số sàn',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình DVD, Điều hòa tự động',
		N'MPV 7 chỗ, rộng rãi, tiết kiệm, phù hợp gia đình và dịch vụ.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 10. Suzuki XL7
		(55, N'30A-00010', N'Suzuki XL7', 2022, N'Trắng', 11, 7, 750000.00, 1, 3, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Điều hòa tự động, Ghế da',
		N'SUV đa dụng 7 chỗ, thiết kế thể thao, nhiều tiện nghi hiện đại.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 11. Suzuki Ertiga
		(60, N'30A-00011', N'Suzuki Ertiga', 2022, N'Xám', 11, 7, 700000.00, 2, 3, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Điều hòa tự động, Ghế da',
		N'MPV 7 chỗ, tiết kiệm, vận hành êm ái, phù hợp gia đình.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 12. Suzuki Ertiga
		(6, N'30A-00012', N'Suzuki Ertiga', 2017, N'Xanh', 11, 7, 550000.00, 2, 3, 1, N'Số sàn',
		N'Lốp dự phòng, Túi khí, Camera lùi, Điều hòa tự động',
		N'MPV 7 chỗ, tiết kiệm, vận hành ổn định, phù hợp gia đình nhỏ.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 13. Mitsubishi Xpander Cross
		(12, N'30A-00013', N'Mitsubishi Xpander Cross', 2023, N'Bạc', 11, 7, 800000.00, 2, 4, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Điều hòa tự động, Ghế da',
		N'MPV gầm cao 7 chỗ, kiểu dáng thể thao, nhiều trang bị tiện nghi.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 14. Mitsubishi Xpander Cross
		(17, N'30A-00014', N'Mitsubishi Xpander Cross', 2022, N'Trắng', 11, 7, 750000.00, 2, 4, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Ghế da',
		N'MPV 7 chỗ, vận hành ổn định, thiết kế mạnh mẽ.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 15. Mitsubishi Xpander
		(23, N'30A-00015', N'Mitsubishi Xpander', 2024, N'Đen', 11, 7, 850000.00, 2, 4, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Điều hòa tự động',
		N'MPV 7 chỗ thế hệ mới, thiết kế hiện đại, tiết kiệm nhiên liệu.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 16. Mitsubishi Xpander
		(28, N'30A-00016', N'Mitsubishi Xpander', 2022, N'Đỏ', 11, 7, 700000.00, 2, 4, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng',
		N'MPV 7 chỗ, tiết kiệm nhiên liệu, phù hợp gia đình, dịch vụ.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 17. Mitsubishi Xpander
		(34, N'30A-00017', N'Mitsubishi Xpander', 2019, N'Bạc', 11, 7, 600000.00, 2, 4, 1, N'Số sàn',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình DVD',
		N'MPV 7 chỗ, tiết kiệm, vận hành ổn định, phù hợp gia đình nhỏ.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 18. Mitsubishi Xforce
		(39, N'30A-00018', N'Mitsubishi Xforce', 2024, N'Trắng', 11, 5, 850000.00, 3, 4, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Đèn LED, Điều hòa tự động',
		N'SUV 5 chỗ, thiết kế thể thao, nhiều tiện nghi hiện đại.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 19. Mitsubishi Triton
		(45, N'30A-00019', N'Mitsubishi Triton', 2017, N'Xanh', 11, 5, 700000.00, 3, 4, 3, N'Số sàn',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình DVD, Gài cầu điện tử',
		N'Bán tải 5 chỗ, động cơ mạnh mẽ, phù hợp địa hình phức tạp.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 20. Mitsubishi Outlander
		(50, N'30A-00020', N'Mitsubishi Outlander', 2018, N'Đen', 11, 7, 800000.00, 3, 4, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình DVD, Cửa sổ trời, Điều hòa tự động',
		N'SUV 7 chỗ, thiết kế sang trọng, nhiều trang bị tiện nghi.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),
		   -- 21. MG5
		(55, N'30A-00021', N'MG5', 2024, N'Trắng', 11, 5, 700000.00, 3, 5, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Màn hình cảm ứng, Camera lùi, Cửa sổ trời, Điều hòa tự động',
		N'MG5 2024 - Sedan trẻ trung, tiện nghi, phù hợp khách hàng trẻ năng động.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 22. MG5
		(7, N'51D-00022', N'MG5', 2022, N'Đen', 11, 5, 650000.00, 2, 5, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Đèn LED, Điều hòa tự động',
		N'Sedan 5 chỗ, thiết kế hiện đại, trang bị nhiều tiện ích an toàn.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 23. MG ZS
		(13, N'51D-00023', N'MG ZS', 2022, N'Đen', 11, 5, 700000.00, 2, 5, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Đèn LED, Ghế da',
		N'SUV đô thị MG ZS, thiết kế khỏe khoắn, nhiều trang bị an toàn hiện đại.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 24. MG ZS 1.5L
		(18, N'51D-00024', N'MG ZS 1.5L', 2024, N'Trắng', 11, 5, 750000.00, 2, 5, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Cảm biến áp suất lốp, Đèn LED',
		N'SUV nhỏ, tiết kiệm nhiên liệu, phù hợp di chuyển đô thị và gia đình nhỏ.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 25. MG RX5
		(24, N'51D-00025', N'MG RX5', 2023, N'Trắng', 11, 5, 800000.00, 2, 5, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Ghế da, Điều hòa tự động',
		N'SUV 5 chỗ, thiết kế sang trọng, vận hành ổn định, trang bị tiện nghi.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 26. Mercedes-Benz E200
		(9, N'43A-00026', N'Mercedes-Benz E200', 2023, N'Đen', 11, 5, 2500000.00, 3, 6, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera 360, Màn hình cảm ứng, Ghế chỉnh điện, Điều hòa tự động, Cửa sổ trời',
		N'Sedan hạng sang, trang bị cao cấp, trải nghiệm đẳng cấp và an toàn.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 27. Mazda CX-8
		(18, N'43A-00027', N'Mazda CX-8', 2020, N'Trắng', 11, 7, 900000.00, 3, 7, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Ghế da, Điều hòa 3 vùng',
		N'SUV 7 chỗ, thiết kế sang, nội thất rộng rãi, trang bị tiện nghi.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 28. Mazda CX-3
		(24, N'43A-00028', N'Mazda CX-3', 2021, N'Đỏ', 11, 5, 750000.00, 3, 7, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Đèn LED',
		N'SUV 5 chỗ nhỏ gọn, trẻ trung, nhiều tính năng an toàn hiện đại.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 29. Mazda 6
		(29, N'43A-00029', N'Mazda 6', 2017, N'Trắng', 11, 5, 600000.00, 3, 7, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình DVD, Ghế chỉnh điện',
		N'Sedan cỡ trung, vận hành êm ái, trang bị đầy đủ tiện nghi cơ bản.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 30. Mazda 3
		(35, N'43A-00030', N'Mazda 3', 2021, N'Trắng', 11, 5, 700000.00, 3, 7, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Đèn LED',
		N'Sedan 5 chỗ, thiết kế trẻ trung hiện đại, vận hành ổn định.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),
		-- 31. KIA Sorento
		(40, N'43A-00031', N'KIA Sorento', 2021, N'Trắng', 11, 7, 1000000.00, 3, 8, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera 360, Màn hình cảm ứng, Ghế chỉnh điện, Điều hòa tự động, Cửa sổ trời',
		N'SUV 7 chỗ cao cấp, nội thất rộng rãi, nhiều trang bị tiện nghi hiện đại.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 32. KIA Sedona
		(46, N'43A-00032', N'KIA Sedona', 2021, N'Trắng', 11, 7, 1100000.00, 3, 8, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Ghế da, Điều hòa tự động, Cửa sổ trời',
		N'MPV 7 chỗ cao cấp, không gian rộng, phù hợp gia đình đông người.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 33. KIA Cerato
		(51, N'43A-00033', N'KIA Cerato', 2021, N'Đen', 11, 5, 650000.00, 3, 8, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Điều hòa tự động',
		N'Sedan 5 chỗ, trẻ trung, vận hành êm ái, phù hợp gia đình nhỏ.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 34. KIA Carnival
		(56, N'43A-00034', N'KIA Carnival', 2024, N'Đen', 11, 7, 1200000.00, 3, 8, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera 360, Màn hình cảm ứng, Ghế chỉnh điện, Điều hòa tự động, Cửa sổ trời',
		N'MPV 7 chỗ hạng sang, rộng rãi, tiện nghi, phù hợp gia đình hoặc doanh nghiệp.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 35. KIA Carnival
		(8, N'43A-00035', N'KIA Carnival', 2023, N'Đen', 11, 7, 1100000.00, 3, 8, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Ghế da, Điều hòa tự động',
		N'MPV 7 chỗ cao cấp, thiết kế sang trọng, phù hợp du lịch và dịch vụ.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 36. KIA Carnival
		(14, N'43A-00036', N'KIA Carnival', 2022, N'Xanh', 11, 7, 1000000.00, 3, 8, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Ghế da, Điều hòa tự động',
		N'MPV 7 chỗ thế hệ mới, hiện đại, nội thất rộng rãi.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 37. KIA Carens
		(19, N'43A-00037', N'KIA Carens', 2024, N'Trắng', 11, 7, 800000.00, 3, 8, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Điều hòa tự động, Ghế da',
		N'MPV 7 chỗ, thiết kế hiện đại, tiết kiệm, phù hợp gia đình.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 38. KIA Carens
		(25, N'43A-00038', N'KIA Carens', 2023, N'Đỏ', 12, 7, 750000.00, 3, 8, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Điều hòa tự động',
		N'MPV 7 chỗ, nhỏ gọn, tiết kiệm nhiên liệu, phù hợp gia đình nhỏ.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 39. Hyundai Stargazer
		(30, N'43A-00039', N'Hyundai Stargazer', 2025, N'Đỏ', 12, 7, 900000.00, 3, 2, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Điều hòa tự động',
		N'MPV 7 chỗ thế hệ mới, thiết kế hiện đại, nhiều tính năng an toàn.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 40. Hyundai Stargazer
		(36, N'43A-00040', N'Hyundai Stargazer', 2024, N'Bạc', 12, 7, 850000.00, 3, 2, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Ghế da',
		N'MPV 7 chỗ, nội thất rộng rãi, tiết kiệm nhiên liệu.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),
			-- 41. Hyundai Grand i10
		(41, N'47A-00041', N'Hyundai Grand i10', 2022, N'Trắng', 11, 5, 500000.00, 3, 2, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Đèn LED, Điều hòa tự động',
		N'Hatchback nhỏ gọn, tiết kiệm nhiên liệu, phù hợp di chuyển đô thị.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 42. Hyundai Custin
		(47, N'50A-00042', N'Hyundai Custin', 2024, N'Trắng', 11, 7, 950000.00, 3, 2, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Ghế da, Điều hòa tự động, Cửa sổ trời',
		N'MPV 7 chỗ mới, thiết kế sang trọng, trang bị tiện nghi cao cấp.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 43. Hyundai Accent
		(52, N'43A-00043', N'Hyundai Accent', 2024, N'Trắng', 11, 5, 600000.00, 3, 2, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Đèn LED, Điều hòa tự động',
		N'Sedan hạng B, thiết kế hiện đại, tiết kiệm nhiên liệu.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 44. Hyundai Accent
		(57, N'43A-00044', N'Hyundai Accent', 2020, N'Trắng', 11, 5, 550000.00, 3, 2, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Đèn LED',
		N'Sedan 5 chỗ, vận hành ổn định, tiết kiệm nhiên liệu, phù hợp gia đình nhỏ.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 45. Hyundai Elantra
		(66, N'15A-00045', N'Hyundai Elantra', 2021, N'Trắng', 11, 5, 700000.00, 4, 2, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Ghế chỉnh điện',
		N'Sedan hạng C, thiết kế thể thao, vận hành êm ái.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 46. Honda Civic
		(26, N'15A-00046', N'Honda Civic', 2020, N'Bạc', 11, 5, 750000.00, 3, 11, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Ghế da, Điều hòa tự động',
		N'Sedan hạng C, phong cách thể thao, nhiều trang bị tiện nghi.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 47. Honda City
		(57, N'15A-00047', N'Honda City', 2018, N'Trắng', 11, 5, 600000.00, 3, 11, 1, N'Số sàn',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình DVD, Điều hòa tự động',
		N'Sedan hạng B, tiết kiệm, vận hành ổn định, phù hợp đi phố.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 48. Honda BR-V
		(41, N'43A-00048', N'Honda BR-V', 2024, N'Đen', 11, 7, 850000.00, 3, 11, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Điều hòa tự động',
		N'MPV 7 chỗ, mới ra mắt, thiết kế thể thao, nội thất rộng rãi.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 49. Honda BR-V G
		(59, N'43A-00049', N'Honda BR-V G', 2024, N'Xanh', 11, 7, 800000.00, 3, 11, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Điều hòa tự động',
		N'MPV 7 chỗ, hiện đại, nhiều tính năng an toàn, tiết kiệm nhiên liệu.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 50. Ford Everest
		(10, N'43A-00050', N'Ford Everest', 2022, N'Trắng', 11, 7, 1200000.00, 4, 10, 3, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera 360, Màn hình cảm ứng, Ghế chỉnh điện, Điều hòa tự động, Cửa sổ trời',
		N'SUV 7 chỗ, động cơ diesel mạnh mẽ, nhiều công nghệ an toàn hỗ trợ.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),
			-- 51. Hyundai Accent
		(57, N'43A-00051', N'Hyundai Accent', 2020, N'Xám', 11, 5, 550000.00, 4, 2, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Đèn LED, Điều hòa tự động',
		N'Sedan hạng B, vận hành ổn định, trang bị tiện nghi cơ bản, tiết kiệm nhiên liệu.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 52. Hyundai Grand i10
		(15, N'15A-00052', N'Hyundai Grand i10', 2022, N'Đen', 11, 5, 500000.00, 4, 2, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Đèn LED',
		N'Hatchback nhỏ gọn, dễ lái, tiết kiệm xăng, phù hợp đi phố.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 53. KIA Carnival
		(56, N'65A-00053', N'KIA Carnival', 2023, N'Xanh', 1, 7, 1100000.00, 5, 8, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera 360, Màn hình cảm ứng, Ghế da, Điều hòa tự động, Cửa sổ trời',
		N'MPV 7 chỗ hạng sang, không gian rộng rãi, tiện nghi hiện đại.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 54. KIA Carnival
		(27, N'65A-00054', N'KIA Carnival', 2022, N'Bạc', 11, 7, 1000000.00, 5, 8, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Ghế da, Điều hòa tự động',
		N'MPV 7 chỗ, thiết kế hiện đại, phù hợp gia đình đông người hoặc dịch vụ.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 55. Mazda 2
		(22, N'65A-00055', N'Mazda 2', 2021, N'Đen', 11, 5, 600000.00, 5, 7, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Đèn LED',
		N'Sedan nhỏ gọn, trẻ trung, nhiều tiện nghi, tiết kiệm nhiên liệu.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 56. Mitsubishi Xpander Cross
		(9, N'75A-00056', N'Mitsubishi Xpander Cross', 2023, N'Đen', 11, 7, 800000.00, 6, 4, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Ghế da, Điều hòa tự động',
		N'MPV 7 chỗ, gầm cao, thiết kế thể thao, trang bị an toàn hiện đại.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 57. Suzuki Ertiga
		(20, N'75A-00057', N'Suzuki Ertiga', 2022, N'Trắng', 11, 7, 750000.00, 6, 3, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Điều hòa tự động, Ghế da',
		N'MPV 7 chỗ, nội thất rộng, vận hành ổn định, tiết kiệm nhiên liệu.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 58. Toyota Corolla Cross
		(10, N'79A-00058', N'Toyota Corolla Cross', 2022, N'Bạc', 11, 5, 900000.00, 7, 9, 4, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera 360, Màn hình cảm ứng, Cửa sổ trời, Điều hòa tự động',
		N'SUV 5 chỗ, động cơ hybrid, tiết kiệm xăng, trang bị an toàn cao cấp.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 59. VinFast Lux AB 2.0
		(21, N'79A-00059', N'VinFast Lux AB 2.0', 2021, N'Đen', 11, 5, 1300000.00, 7, 1, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Ghế chỉnh điện, Điều hòa tự động',
		N'Sedan 5 chỗ, thiết kế sang trọng, máy mạnh mẽ, nhiều tiện nghi hiện đại.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 60. VinFast VF8
		(11, N'72A-00060', N'VinFast VF8', 2022, N'Xanh', 11, 8, 1200000.00, 8, 1, 2, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera 360, Màn hình cảm ứng, Đèn LED, Điều hòa tự động',
		N'SUV điện 8 chỗ, nội thất rộng, vận hành êm ái, thiết kế hiện đại.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),
		-- 61. Honda BR-V G
		(22, N'72A-00061', N'Honda BR-V G', 2024, N'Trắng', 11, 7, 800000.00, 8, 11, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Điều hòa tự động, Ghế da',
		N'MPV 7 chỗ, thiết kế thể thao, nhiều tính năng an toàn, vận hành ổn định.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 62. Toyota Corolla Cross
		(66, N'30A-00062', N'Toyota Corolla Cross', 2022, N'Đen', 11, 5, 900000.00, 1, 9, 4, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera 360, Màn hình cảm ứng, Cửa sổ trời, Điều hòa tự động',
		N'SUV 5 chỗ, động cơ hybrid, tiết kiệm nhiên liệu, trang bị an toàn cao cấp.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 63. Toyota Corolla Cross
		(12, N'30A-00063', N'Toyota Corolla Cross', 2022, N'Xanh', 11, 5, 900000.00, 1, 9, 4, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera 360, Màn hình cảm ứng, Đèn LED, Điều hòa tự động',
		N'SUV 5 chỗ, thiết kế hiện đại, nhiều tính năng an toàn, tiết kiệm nhiên liệu.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 64. Mazda 3
		(42, N'30A-00064', N'Mazda 3', 2021, N'Xanh', 11, 5, 700000.00, 1, 7, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Đèn LED, Điều hòa tự động',
		N'Sedan 5 chỗ, thiết kế trẻ trung, vận hành ổn định, trang bị tiện nghi hiện đại.',
		'2025-05-31 20:40:20', '2025-05-31 20:08:20', 0),

		-- 65. KIA Sedona
		(56, N'30A-00065', N'KIA Sedona', 2021, N'Đỏ', 11, 7, 1100000.00, 1, 8, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Ghế da, Điều hòa tự động, Cửa sổ trời',
		N'MPV 7 chỗ, không gian rộng rãi, nội thất sang trọng, phù hợp gia đình đông người.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 66. KIA Sedona
		(28, N'30A-00066', N'KIA Sedona', 2021, N'Bạc', 11, 7, 1100000.00, 1, 8, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Điều hòa tự động, Ghế da',
		N'MPV 7 chỗ, nội thất tiện nghi, vận hành êm ái, phù hợp gia đình.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 67. KIA Cerato
		(29, N'39-00000', N'KIA Cerato', 2021, N'Trắng', 11, 5, 650000.00, 1, 8, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Điều hòa tự động',
		N'Sedan 5 chỗ, vận hành ổn định, tiết kiệm nhiên liệu, phù hợp gia đình nhỏ.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 68. KIA Carnival
		(70, N'39-00040', N'KIA Carnival', 2022, N'Bạc', 11, 7, 1000000.00, 1, 8, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera lùi, Màn hình cảm ứng, Ghế da, Điều hòa tự động, Cửa sổ trời',
		N'MPV 7 chỗ cao cấp, nhiều tiện nghi, không gian rộng rãi cho gia đình.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 69. Hyundai Grand i10
		(45, N'30A-00069', N'Hyundai Grand i10', 2022, N'Bạc', 11, 5, 500000.00, 1, 2, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Điều hòa tự động',
		N'Hatchback nhỏ gọn, tiết kiệm xăng, phù hợp di chuyển nội đô.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 70. Hyundai Accent
		(50, N'30A-00070', N'Hyundai Accent', 2020, N'Đen', 11, 5, 550000.00, 1, 2, 1, N'Số tự động',
		N'Lốp dự phòng, Túi khí, Camera lùi, Màn hình cảm ứng, Đèn LED',
		N'Sedan 5 chỗ, vận hành ổn định, tiết kiệm nhiên liệu, phù hợp gia đình nhỏ.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0),

		-- 71. Ford Everest
		(55, N'30A-00071', N'Ford Everest', 2022, N'Trắng', 11, 7, 1200000.00, 1, 10, 3, N'Số tự động',
		N'Lốp dự phòng, Túi khí an toàn, Camera 360, Màn hình cảm ứng, Ghế chỉnh điện, Điều hòa tự động, Cửa sổ trời',
		N'SUV 7 chỗ cao cấp, động cơ diesel mạnh mẽ, nhiều công nghệ an toàn hỗ trợ.',
		'2025-05-31 20:08:00', '2025-05-31 20:08:00', 0);
GO

-- 17. Bảng Driver (SỬA: Thêm country_code)
INSERT INTO Driver (supplier_id, driver_name, dob, address, phone, country_code, license_number)
VALUES 
    (2, N'Nguyễn Văn D', '1980-01-01', N'123 Đường GHI, TP.HCM', N'0904567890', '+84', 'LICENSE001'),
    (2, N'Trần Thị E', '1985-05-05', N'456 Đường JKL, Hà Nội', N'0905678901', '+84', 'LICENSE002'),
    (2, N'Lê Văn F', '1990-10-10', N'789 Đường MNO, Đà Nẵng', N'0906789012', '+84', 'LICENSE003');
GO

-- 18. Bảng Promotion
INSERT INTO Promotion (code, discount_percentage, start_date, end_date, description)
VALUES 
    (N'PROMO10', 10.00, '2025-05-16', '2025-12-31', N'Giảm 10% đơn đầu tiên'),
    (N'PROMO20', 20.00, '2025-06-01', '2025-06-30', N'Giảm 20% trong tháng 6'),
    (N'PROMO15', 15.00, '2025-07-01', '2025-07-31', N'Giảm 15% cho khách VIP');
GO

-- 19. Bảng Booking
INSERT INTO Booking (customer_id, car_id, driver_id, region_id, start_date, end_date, pickup_location, dropoff_location, status_id, seat_number, deposit_amount, promo_id)
VALUES 
    (3, 5, 1, 2, '2025-09-10', '2025-09-11', N'Hà Nội', N'Hải Phòng', 2, 5, 600000.00, 1),
    (1, 6, 1, 1, '2025-09-10', '2025-09-11', N'Đà Nẵng', N'Hội An', 1, 7, 500000.00, 2),
    (4, 7, 1, 3, '2025-09-10', '2025-09-11', N'Nha Trang', N'Cam Ranh', 2, 6, 450000.00, NULL),
    (2, 8, 1, 1, '2025-09-10', '2025-09-11', N'Cần Thơ', N'Vĩnh Long', 1, 5, 350000.00, 3);
GO
INSERT INTO Booking (customer_id, car_id, driver_id, region_id, start_date, end_date, pickup_location, dropoff_location, status_id, seat_number, deposit_amount, promo_id)
VALUES 
    (5, 9, 1, 2, '2025-09-10', '2025-09-11', N'Huế', N'Phong Điền', 1, 4, 400000.00, 1),
    (3, 10, 1, 1, '2025-09-10', '2025-09-11', N'TP.HCM', N'Vũng Tàu', 2, 5, 550000.00, NULL),
    (2, 11, 1, 3, '2025-09-10', '2025-09-11', N'Đà Lạt', N'Bảo Lộc', 1, 6, 450000.00, 2),
    (1, 12, 1, 1, '2025-09-10', '2025-09-11', N'Hà Nội', N'Ninh Bình', 2, 7, 500000.00, 3),
    (4, 13, 1, 2, '2025-09-10', '2025-09-11', N'Quảng Ninh', N'Hạ Long', 1, 5, 600000.00, NULL);
GO
INSERT INTO Booking (customer_id, car_id, driver_id, region_id, start_date, end_date, pickup_location, dropoff_location, status_id, seat_number, deposit_amount, promo_id)
VALUES 
    (3, 10, 2, 2, '2025-09-10', '2025-09-11', N'Hà Nội', N'Hải Dương', 2, 5, 450000.00, 1),
    (4, 10, 3, 1, '2025-09-10', '2025-09-11', N'Đà Nẵng', N'Hội An', 1, 4, 500000.00, 2),
    (5, 10, 2, 3, '2025-09-10', '2025-09-11', N'Nha Trang', N'Cam Ranh', 2, 5, 550000.00, NULL),
    (1, 10, 2, 1, '2025-09-10', '2025-09-11', N'Cần Thơ', N'Rạch Giá', 1, 4, 400000.00, 3);
GO

-- 20. Bảng BookingFinancials
INSERT INTO BookingFinancials (booking_id, total_fare, applied_discount)
VALUES 
    (1, 2000000.00, 200000.00),
    (2, 1400000.00, 0.00),
    (3, 1800000.00, 270000.00);
GO 

-- 21. Bảng BookingTax
INSERT INTO BookingTax (booking_id, tax_id, tax_amount)
VALUES 
    (1, 1, 200000.00),
    (2, 1, 140000.00),
    (3, 1, 180000.00);
GO

-- 22. Bảng Deposit
INSERT INTO Deposit (booking_id, amount, region_id, status_id, refund_amount, refund_date)
VALUES 
    (1, 500000.00, 1, 2, 500000.00, '2025-05-22'), -- region_id = 1 cho VND
    (2, 350000.00, 1, 2, 350000.00, '2025-06-04'), -- region_id = 1 cho VND
    (3, 450000.00, 1, 2, 450000.00, '2025-07-05'); -- region_id = 1 cho VND
GO

-- 23. Bảng Rating
INSERT INTO Rating (booking_id, customer_id, car_id, rating_score, comment)
VALUES 
    (1, 1, 1, 5, N'Dịch vụ tốt'),
    (2, 1, 2, 4, N'Xe sạch sẽ'),
    (3, 1, 3, 5, N'Tài xế thân thiện');
INSERT INTO Rating (booking_id, customer_id, car_id, rating_score, comment)
VALUES 
    (10, 2, 4, 4, N'Chuyến đi thoải mái, xe mới'),
    (11, 3, 5, 5, N'Tài xế đúng giờ, dịch vụ tuyệt vời'),
    (12, 1, 6, 3, N'Xe ổn nhưng điều hòa hơi yếu'),
    (9, 4, 7, 5, N'Rất hài lòng, sẽ đặt lại lần sau'),
    (8, 2, 8, 4, N'Chuyến đi tốt, nhưng giá hơi cao');
GO

-- 24. Bảng Payment
INSERT INTO Payment (booking_id, amount, region_id, transaction_id, payment_method, payment_status_id, payment_type)
VALUES 
    (1, 2000000.00, 1, N'TXN001', 'cash', 15, 'deposit'), -- region_id = 1 cho VND
    (2, 1400000.00, 1, N'TXN002', 'cash', 15, 'deposit'),      -- region_id = 1 cho VND
    (3, 1800000.00, 1, N'TXN003', 'cash', 15, 'deposit');        -- region_id = 1 cho VND
GO

-- 25. Bảng Maintenance
INSERT INTO Maintenance (car_id, start_date, end_date, description, cost, region_id)
VALUES 
    (1, '2025-05-10', '2025-05-11', N'Bảo dưỡng định kỳ', 1000000.00, 1), -- region_id = 1 cho VND
    (2, '2025-05-12', '2025-05-13', N'Sửa chữa động cơ', 2000000.00, 1),  -- region_id = 1 cho VND
    (3, '2025-05-14', '2025-05-15', N'Thay lốp', 1500000.00, 1);         -- region_id = 1 cho VND
GO
-- 26. Bảng Insurance
INSERT INTO Insurance (car_id, policy_number, provider, start_date, end_date, coverage_details)
VALUES 
    (1, 'INS-2025-0001', N'Bảo Việt', '2025-07-01', '2026-06-30', N'Bảo hiểm toàn diện cho xe, bao gồm tai nạn và hư hỏng'),
    (4, 'INS-2025-0002', N'PVI Care', '2025-06-20', '2026-06-19', N'Bảo hiểm thân xe và trách nhiệm dân sự'),
    (5, 'INS-2025-0003', N'Liberty Insurance', '2025-08-01', '2026-07-31', N'Bảo hiểm tai nạn và thiệt hại tài sản'),
    (6, 'INS-2025-0004', N'Bảo Minh', '2025-07-15', '2026-07-14', N'Bảo hiểm xe và hành khách, hỗ trợ cứu hộ 24/7'),
    (7, 'INS-2025-0005', N'PJICO', '2025-09-01', '2026-08-31', N'Bảo hiểm toàn diện, bao gồm mất cắp và thiên tai');
GO
INSERT INTO Insurance (car_id, policy_number, provider, start_date, end_date, coverage_details)
VALUES 
    (2, 'INS-2025-0006', N'Bảo Việt', '2025-06-25', '2026-06-24', N'Bảo hiểm toàn diện, bao gồm tai nạn và hư hỏng'),
    (3, 'INS-2025-0007', N'PVI Care', '2025-07-01', '2026-06-30', N'Bảo hiểm thân xe và trách nhiệm dân sự'),
    (8, 'INS-2025-0008', N'Liberty Insurance', '2025-07-15', '2026-07-14', N'Bảo hiểm tai nạn, thiệt hại tài sản và cứu hộ'),
    (9, 'INS-2025-0009', N'Bảo Minh', '2025-08-01', '2026-07-31', N'Bảo hiểm xe, hành khách và mất cắp'),
    (10, 'INS-2025-0010', N'PJICO', '2025-08-15', '2026-08-14', N'Bảo hiểm toàn diện, bao gồm thiên tai'),
    (11, 'INS-2025-0011', N'Bảo Việt', '2025-09-01', '2026-08-31', N'Bảo hiểm trách nhiệm dân sự và cứu hộ 24/7'),
    (12, 'INS-2025-0012', N'PVI Care', '2025-09-15', '2026-09-14', N'Bảo hiểm tai nạn và thiệt hại tài sản'),
    (13, 'INS-2025-0013', N'Liberty Insurance', '2025-10-01', '2026-09-30', N'Bảo hiểm toàn diện, bao gồm mất cắp'),
    (14, 'INS-2025-0014', N'Bảo Minh', '2025-10-15', '2026-10-14', N'Bảo hiểm xe và hành khách'),
    (15, 'INS-2025-0015', N'PJICO', '2025-11-01', '2026-10-31', N'Bảo hiểm toàn diện và cứu hộ'),
    (16, 'INS-2025-0016', N'Bảo Việt', '2025-11-15', '2026-11-14', N'Bảo hiểm tai nạn và trách nhiệm dân sự'),
    (17, 'INS-2025-0017', N'PVI Care', '2025-12-01', '2026-11-30', N'Bảo hiểm xe, mất cắp và thiên tai'),
    (18, 'INS-2025-0018', N'Liberty Insurance', '2025-12-15', '2026-12-14', N'Bảo hiểm toàn diện và cứu hộ 24/7'),
    (19, 'INS-2025-0019', N'Bảo Minh', '2026-01-01', '2027-01-01', N'Bảo hiểm tai nạn và thiệt hại tài sản'),
    (20, 'INS-2025-0020', N'PJICO', '2026-01-15', '2027-01-14', N'Bảo hiểm xe và hành khách'),
    (21, 'INS-2025-0021', N'Bảo Việt', '2025-06-25', '2026-06-24', N'Bảo hiểm toàn diện, bao gồm tai nạn'),
    (22, 'INS-2025-0022', N'PVI Care', '2025-07-01', '2026-06-30', N'Bảo hiểm trách nhiệm dân sự'),
    (23, 'INS-2025-0023', N'Liberty Insurance', '2025-07-15', '2026-07-14', N'Bảo hiểm xe và cứu hộ'),
    (24, 'INS-2025-0024', N'Bảo Minh', '2025-08-01', '2026-07-31', N'Bảo hiểm mất cắp và thiên tai'),
    (25, 'INS-2025-0025', N'PJICO', '2025-08-15', '2026-08-14', N'Bảo hiểm toàn diện và hành khách'),
    (26, 'INS-2025-0026', N'Bảo Việt', '2025-09-01', '2026-08-31', N'Bảo hiểm tai nạn và thiệt hại'),
    (27, 'INS-2025-0027', N'PVI Care', '2025-09-15', '2026-09-14', N'Bảo hiểm xe và cứu hộ 24/7'),
    (28, 'INS-2025-0028', N'Liberty Insurance', '2025-10-01', '2026-09-30', N'Bảo hiểm toàn diện và mất cắp'),
    (29, 'INS-2025-0029', N'Bảo Minh', '2025-10-15', '2026-10-14', N'Bảo hiểm trách nhiệm dân sự'),
    (30, 'INS-2025-0030', N'PJICO', '2025-11-01', '2026-10-31', N'Bảo hiểm xe và hành khách'),
    (31, 'INS-2025-0031', N'Bảo Việt', '2025-11-15', '2026-11-14', N'Bảo hiểm tai nạn và thiên tai'),
    (32, 'INS-2025-0032', N'PVI Care', '2025-12-01', '2026-11-30', N'Bảo hiểm toàn diện và cứu hộ'),
    (33, 'INS-2025-0033', N'Liberty Insurance', '2025-12-15', '2026-12-14', N'Bảo hiểm mất cắp và thiệt hại'),
    (34, 'INS-2025-0034', N'Bảo Minh', '2026-01-01', '2027-01-01', N'Bảo hiểm xe và hành khách'),
    (35, 'INS-2025-0035', N'PJICO', '2026-01-15', '2027-01-14', N'Bảo hiểm toàn diện và cứu hộ'),
    (36, 'INS-2025-0036', N'Bảo Việt', '2025-06-25', '2026-06-24', N'Bảo hiểm tai nạn và trách nhiệm dân sự'),
    (37, 'INS-2025-0037', N'PVI Care', '2025-07-01', '2026-06-30', N'Bảo hiểm xe và mất cắp'),
    (38, 'INS-2025-0038', N'Liberty Insurance', '2025-07-15', '2026-07-14', N'Bảo hiểm toàn diện và thiên tai'),
    (39, 'INS-2025-0039', N'Bảo Minh', '2025-08-01', '2026-07-31', N'Bảo hiểm hành khách và cứu hộ'),
    (40, 'INS-2025-0040', N'PJICO', '2025-08-15', '2026-08-14', N'Bảo hiểm tai nạn và thiệt hại'),
    (41, 'INS-2025-0041', N'Bảo Việt', '2025-09-01', '2026-08-31', N'Bảo hiểm toàn diện và mất cắp'),
    (42, 'INS-2025-0042', N'PVI Care', '2025-09-15', '2026-09-14', N'Bảo hiểm trách nhiệm dân sự'),
    (43, 'INS-2025-0043', N'Liberty Insurance', '2025-10-01', '2026-09-30', N'Bảo hiểm xe và cứu hộ 24/7'),
    (44, 'INS-2025-0044', N'Bảo Minh', '2025-10-15', '2026-10-14', N'Bảo hiểm tai nạn và thiên tai'),
    (45, 'INS-2025-0045', N'PJICO', '2025-11-01', '2026-10-31', N'Bảo hiểm toàn diện và hành khách'),
    (46, 'INS-2025-0046', N'Bảo Việt', '2025-11-15', '2026-11-14', N'Bảo hiểm mất cắp và thiệt hại'),
    (47, 'INS-2025-0047', N'PVI Care', '2025-12-01', '2026-11-30', N'Bảo hiểm xe và cứu hộ'),
    (48, 'INS-2025-0048', N'Liberty Insurance', '2025-12-15', '2026-12-14', N'Bảo hiểm toàn diện và thiên tai'),
    (49, 'INS-2025-0049', N'Bảo Minh', '2026-01-01', '2027-01-01', N'Bảo hiểm hành khách và tai nạn'),
    (50, 'INS-2025-0050', N'PJICO', '2026-01-15', '2027-01-14', N'Bảo hiểm trách nhiệm dân sự'),
    (51, 'INS-2025-0051', N'Bảo Việt', '2025-06-25', '2026-06-24', N'Bảo hiểm xe và mất cắp'),
    (52, 'INS-2025-0052', N'PVI Care', '2025-07-01', '2026-06-30', N'Bảo hiểm toàn diện và cứu hộ'),
    (53, 'INS-2025-0053', N'Liberty Insurance', '2025-07-15', '2026-07-14', N'Bảo hiểm tai nạn và thiệt hại'),
    (54, 'INS-2025-0054', N'Bảo Minh', '2025-08-01', '2026-07-31', N'Bảo hiểm hành khách và thiên tai'),
    (55, 'INS-2025-0055', N'PJICO', '2025-08-15', '2026-08-14', N'Bảo hiểm toàn diện và mất cắp'),
    (56, 'INS-2025-0056', N'Bảo Việt', '2025-09-01', '2026-08-31', N'Bảo hiểm xe và cứu hộ 24/7'),
    (57, 'INS-2025-0057', N'PVI Care', '2025-09-15', '2026-09-14', N'Bảo hiểm tai nạn và trách nhiệm dân sự'),
    (58, 'INS-2025-0058', N'Liberty Insurance', '2025-10-01', '2026-09-30', N'Bảo hiểm toàn diện và hành khách'),
    (59, 'INS-2025-0059', N'Bảo Minh', '2025-10-15', '2026-10-14', N'Bảo hiểm mất cắp và thiên tai'),
    (60, 'INS-2025-0060', N'PJICO', '2025-11-01', '2026-10-31', N'Bảo hiểm xe và cứu hộ'),
    (61, 'INS-2025-0061', N'Bảo Việt', '2025-11-15', '2026-11-14', N'Bảo hiểm toàn diện và tai nạn'),
    (62, 'INS-2025-0062', N'PVI Care', '2025-12-01', '2026-11-30', N'Bảo hiểm trách nhiệm dân sự'),
    (63, 'INS-2025-0063', N'Liberty Insurance', '2025-12-15', '2026-12-14', N'Bảo hiểm hành khách và mất cắp'),
    (64, 'INS-2025-0064', N'Bảo Minh', '2026-01-01', '2027-01-01', N'Bảo hiểm xe và thiên tai'),
    (65, 'INS-2025-0065', N'PJICO', '2026-01-15', '2027-01-14', N'Bảo hiểm toàn diện và cứu hộ'),
    (66, 'INS-2025-0066', N'Bảo Việt', '2025-06-25', '2026-06-24', N'Bảo hiểm tai nạn và thiệt hại'),
    (67, 'INS-2025-0067', N'PVI Care', '2025-07-01', '2026-06-30', N'Bảo hiểm hành khách và cứu hộ'),
    (68, 'INS-2025-0068', N'  Liberty Insurance', '2025-07-15', '2026-07-14', N'Bảo hiểm toàn diện và mất cắp'),
    (69, 'INS-2025-0069', N'Bảo Minh', '2025-08-01', '2026-07-31', N'Bảo hiểm xe và trách nhiệm dân sự'),
    (70, 'INS-2025-0070', N'PJICO', '2025-08-15', '2026-08-14', N'Bảo hiểm tai nạn và thiên tai'),
    (71, 'INS-2025-0071', N'Bảo Việt', '2025-09-01', '2026-08-31', N'Bảo hiểm toàn diện và cứu hộ 24/7');
GO

-- 27. Bảng Cancellation
INSERT INTO Cancellation (booking_id, reason, refund_amount, region_id, status_id)
VALUES 
    (1, N'Khách hàng hủy', 1500000.00, 1, 5), -- region_id = 1 cho VND
    (2, N'Lỗi hệ thống', 1400000.00, 1, 5);   -- region_id = 1 cho VND
GO

-- 28. Bảng Notification (SỬA: Thêm thông báo chatbox)
INSERT INTO Notification (user_id, message, type, status_id)
VALUES 
    (1, N'Đặt xe của bạn đã được xác nhận', 'email', 1),
    (2, N'Có yêu cầu đặt xe mới', 'in_app', 1),
    (3, N'Hệ thống bảo trì', 'email', 1),
    (1, N'Hợp đồng cho đặt xe ID 1 đã được tạo', 'chatbox', 1),
    (2, N'Hợp đồng cho đặt xe ID 1 đã được tạo', 'chatbox', 1);
GO

-- 29. Bảng SupplierRevenue
INSERT INTO SupplierRevenue (supplier_id, booking_id, amount, region_id)
VALUES 
    (2, 1, 1800000.00, 1), -- region_id = 1 cho VND
    (2, 2, 1260000.00, 1), -- region_id = 1 cho VND
    (2, 3, 1620000.00, 1); -- region_id = 1 cho VND
GO

-- 30. Bảng UserActionLog
INSERT INTO UserActionLog (user_id, action, details)
VALUES 
    (1, N'Đặt xe', N'Đặt xe ID 1'),
    (2, N'Xác nhận đặt xe', N'Xác nhận đặt xe ID 2'),
    (3, N'Đăng nhập', N'Đăng nhập lúc 2025-05-16');
GO

-- 31. Bảng ChatMessage (MỚI)
INSERT INTO ChatMessage (sender_id, receiver_id, booking_id, message_content, original_language)
VALUES 
    (1, 2, 1, N'Chào bạn, tôi muốn nhận xe sớm hơn 1 tiếng được không?', 'en'),
    (2, 1, 1, N'Được, tôi sẽ sắp xếp. Bạn xác nhận lại giờ nhé.', 'vi'),
    (3, 1, 1, N'Hợp đồng cho đặt xe ID 1 đã được tạo. Vui lòng kiểm tra.', 'vi'),
    (3, 2, 1, N'Hợp đồng cho đặt xe ID 1 đã được tạo. Vui lòng kiểm tra.', 'vi');
GO

-- 32. Bảng Contract
INSERT INTO Contract (booking_id, contract_code, customer_id, supplier_id, car_id, driver_id, start_date, end_date, terms_and_conditions, contract_status_id)
VALUES 
    (1, 'CONTRACT-1-20250516', 1, 2, 1, 1, '2025-05-22', '2025-05-23', N'Điều khoản...', 2),
    (2, 'CONTRACT-2-20250516', 1, 2, 2, 2, '2025-05-22', '2025-06-03', N'Điều khoản...', 2),
    (3, 'CONTRACT-3-20250516', 1, 2, 3, 3, '2025-05-22', '2025-07-04', N'Điều khoản...', 2);
GO

-- 16 Chèn ảnh vào bảng Image
    -- VinFast VF8 2022 (car_id = 1)
INSERT INTO [Image] (car_id, image_url, description, is_main)
VALUES 
    -- VinFast VF8 2022 (car_id = 1)
    (1, N'/images/Vinfast_VF8_2022_7.png', N'Hình chính VinFast VF8 2022', 1),
    (1, N'/images/Vinfast_VF8_2022_8.jpg', N'Hình phụ VinFast VF8 2022', 0),
    (1, N'/images/Vinfast_VF8_2022_6.jpg', N'Hình phụ VinFast VF8 2022', 0),
	(1, N'/images/Vinfast_VF8_2022_9.jpg', N'Hình phụ VinFast VF8 2022', 0),
	(1, N'/images/Vinfast_VF8_2022_5.png', N'Hình phụ VinFast VF8 2022', 0),
    -- VinFast Lux SA 2.0 2021 (car_id = 2)
    (2, N'/images/Vinfast_Lux_SA_20_2021_5.jpg', N'Hình chính VinFast Lux SA 2.0 2021', 1),
    (2, N'/images/Vinfast_Lux_SA_20_2021_9.jpg', N'Hình phụ VinFast Lux SA 2.0 2021', 0),
    (2, N'/images/Vinfast_Lux_SA_20_2021_7.jpg', N'Hình phụ VinFast Lux SA 2.0 2021', 0),
    (2, N'/images/Vinfast_Lux_SA_20_2021_14.jpg', N'Hình phụ VinFast Lux SA 2.0 2021', 0),
    -- VinFast Lux A 2.0 2021 (car_id = 3)
    (3, N'/images/VinFast_Lux_A_20_2021_15.jpg', N'Hình chính VinFast Lux A 2.0 2021', 1),
    (3, N'/images/VinFast_Lux_A_20_2021_14.jpg', N'Hình phụ VinFast Lux A 2.0 2021', 0),
    (3, N'/images/VinFast_Lux_A_20_2021_10.jpg', N'Hình phụ VinFast Lux A 2.0 2021', 0),
    (3, N'/images/VinFast_Lux_A_20_2021_7.jpg', N'Hình phụ VinFast Lux A 2.0 2021', 0),
    (3, N'/images/VinFast_Lux_A_20_2021_6.jpg', N'Hình phụ VinFast Lux A 2.0 2021', 0),
    -- Hyundai Venue 2024 (car_id = 4)
    (4, N'/images/VENUE_2024_6.jpg', N'Hình chính Hyundai Venue 2024', 1),
    (4, N'/images/VENUE_2024_8.jpg', N'Hình phụ Hyundai Venue 2024', 0),
    (4, N'/images/VENUE_2024_7.jpg', N'Hình phụ Hyundai Venue 2024', 0),
    (4, N'/images/VENUE_2024_9.jpg', N'Hình phụ Hyundai Venue 2024', 0),
    (4, N'/images/VENUE_2024_5.jpg', N'Hình phụ Hyundai Venue 2024', 0),
    -- Toyota Wigo 2023 (car_id = 5)
    (5, N'/images/Toyota_Wigo_2023_13.jpg', N'Hình chính Toyota Wigo 2023', 1),
    (5, N'/images/Toyota_Wigo_2023_12.jpg', N'Hình phụ Toyota Wigo 2023', 0),
    (5, N'/images/Toyota_Wigo_2023_6.jpg', N'Hình phụ Toyota Wigo 2018', 0),
    (5, N'/images/Toyota_Wigo_2023_7.jpg', N'Hình phụ Toyota Wigo 2018', 0),
    (5, N'/images/Toyota_Wigo_2023_8.jpg', N'Hình phụ Toyota Wigo 2018', 0),
    -- Toyota Vios 2018 (car_id = 6)
    (6, N'/images/Toyota_Vios_2018_9.jpg', N'Hình chính Toyota Vios 2018', 1),
    (6, N'/images/Toyota_Vios_2018_7.jpg', N'Hình phụ Toyota Vios 2018', 0),
    (6, N'/images/Toyota_Vios_2018_6.jpg', N'Hình phụ Toyota Vios 2018', 0),
    (6, N'/images/Toyota_Vios_2018_4.jpg', N'Hình phụ Toyota Vios 2018', 0),
    (6, N'/images/Toyota_Vios_2018_8.jpg', N'Hình phụ Toyota Vios 2018', 0),
    -- Toyota Veloz 2022 (car_id = 7)
    (7, N'/images/Toyota_Veloz_2022_13.jpg', N'Hình chính Toyota Veloz 2022', 1),
    (7, N'/images/Toyota_Veloz_2022_12.jpg', N'Hình phụ Toyota Veloz 2022', 0),
    (7, N'/images/Toyota_Veloz_2022_7.jpg', N'Hình phụ Toyota Veloz 2022', 0),
    (7, N'/images/Toyota_Veloz_2022_3.jpg', N'Hình phụ Toyota Veloz 2022', 0),
    (7, N'/images/Toyota_Veloz_2022_2.jpg', N'Hình phụ Toyota Veloz 2022', 0),
    -- Toyota Corolla Cross 2022 (car_id = 8)
    (8, N'/images/Toyota_Corolla_Cross_2022_7.jpg', N'Hình chính Toyota Corolla Cross 2022', 1),
    (8, N'/images/Toyota_Corolla_Cross_2022_12.jpg', N'Hình phụ Toyota Corolla Cross 2022', 0),
    (8, N'/images/Toyota_Corolla_Cross_2022_14.jpg', N'Hình phụ Toyota Corolla Cross 2022', 0),
    (8, N'/images/Toyota_Corolla_Cross_2022_6.jpg', N'Hình phụ Toyota Corolla Cross 2022', 0),
    -- Toyota Avanza 2023 (car_id = 9)
    (9, N'/images/Toyota_Avanza_2023_13.jpg', N'Hình chính Toyota Avanza 2023', 1),
    (9, N'/images/Toyota_Avanza_2023_8.jpg', N'Hình phụ Toyota Avanza 2023', 0),
    (9, N'/images/Toyota_Avanza_2023_7.jpg', N'Hình phụ Toyota Avanza 2023', 0),
    (9, N'/images/Toyota_Avanza_2023_6.jpg', N'Hình phụ Toyota Avanza 2023', 0),
    (9, N'/images/Toyota_Avanza_2023_5.jpg', N'Hình phụ Toyota Avanza 2023', 0),
    -- Suzuki XL7 2022 (car_id = 10)
    (10, N'/images/Suzuki_XL7_2022_7.jpg', N'Hình chính Suzuki XL7 2022', 1),
    (10, N'/images/Suzuki_XL7_2022_10.jpg', N'Hình phụ Suzuki XL7 2022', 0),
    (10, N'/images/Suzuki_XL7_2022_6.jpg', N'Hình phụ Suzuki XL7 2022', 0),
    (10, N'/images/Suzuki_XL7_2022_5.jpg', N'Hình phụ Suzuki XL7 2022', 0),
    -- Suzuki Ertiga 2022 (car_id = 11)
    (11, N'/images/Suzuki_Ertiga_2022_9.jpg', N'Hình chính Suzuki Ertiga 2022', 1),
    (11, N'/images/Suzuki_Ertiga_2022_8.jpg', N'Hình phụ Suzuki Ertiga 2022', 0),
    (11, N'/images/Suzuki_Ertiga_2022_7.jpg', N'Hình phụ Suzuki Ertiga 2022', 0),
    (11, N'/images/Suzuki_Ertiga_2022_6.jpg', N'Hình phụ Suzuki Ertiga 2022', 0),
    (11, N'/images/Suzuki_Ertiga_2022_2.jpg', N'Hình phụ Suzuki Ertiga 2022', 0),
    -- Suzuki Ertiga 2017 (car_id = 12)
    (12, N'/images/Suzuki_Ertiga_2017_10.jpg', N'Hình chính Suzuki Ertiga 2017', 1),
    (12, N'/images/Suzuki_Ertiga_2017_8.jpg', N'Hình phụ Suzuki Ertiga 2017', 0),
    (12, N'/images/Suzuki_Ertiga_2017_7.jpg', N'Hình phụ Suzuki Ertiga 2017', 0),
    (12, N'/images/Suzuki_Ertiga_2017_6.jpg', N'Hình phụ Suzuki Ertiga 2017', 0),
    (12, N'/images/Suzuki_Ertiga_2017_5.jpg', N'Hình phụ Suzuki Ertiga 2017', 0),
    -- Mitsubishi Xpander Cross 2023 (car_id = 13)
    (13, N'/images/Mitsubishi_Xpander_Cross_2023_5.jpg', N'Hình chính Mitsubishi Xpander Cross 2023', 1),
    (13, N'/images/Mitsubishi_Xpander_Cross_2023_10.jpg', N'Hình phụ Mitsubishi Xpander Cross 2023', 0),
    (13, N'/images/Mitsubishi_Xpander_Cross_2023_7.jpg', N'Hình phụ Mitsubishi Xpander Cross 2023', 0),
    (13, N'/images/Mitsubishi_Xpander_Cross_2023_6.jpg', N'Hình phụ Mitsubishi Xpander Cross 2023', 0),
    (13, N'/images/Mitsubishi_Xpander_Cross_2023_13.jpg', N'Hình phụ Mitsubishi Xpander Cross 2023', 0),
    -- Mitsubishi Xpander Cross 2022 (car_id = 14)
    (14, N'/images/Mitsubishi_Xpander_Cross_2022_10.jpg', N'Hình chính Mitsubishi Xpander Cross 2022', 1),
    (14, N'/images/Mitsubishi_Xpander_Cross_2022_14.jpg', N'Hình phụ Mitsubishi Xpander Cross 2022', 0),
    (14, N'/images/Mitsubishi_Xpander_Cross_2022_8.jpg', N'Hình phụ Mitsubishi Xpander Cross 2022', 0),
    (14, N'/images/Mitsubishi_Xpander_Cross_2022_7.jpg', N'Hình phụ Mitsubishi Xpander Cross 2022', 0),
    (14, N'/images/Mitsubishi_Xpander_Cross_2022_6.jpg', N'Hình phụ Mitsubishi Xpander Cross 2022', 0),
    -- Mitsubishi Xpander 2024 (car_id = 15)
    (15, N'/images/Mitsubishi_Xpander_2024_10.jpg', N'Hình chính Mitsubishi Xpander 2024', 1),
    (15, N'/images/Mitsubishi_Xpander_2024_14.jpg', N'Hình phụ Mitsubishi Xpander 2024', 0),
    (15, N'/images/Mitsubishi_Xpander_2024_15.jpg', N'Hình phụ Mitsubishi Xpander 2024', 0),
    (15, N'/images/Mitsubishi_Xpander_2024_6.jpg', N'Hình phụ Mitsubishi Xpander 2024', 0),
    (15, N'/images/Mitsubishi_Xpander_2024_5.jpg', N'Hình phụ Mitsubishi Xpander 2024', 0),
    -- Mitsubishi Xpander 2022 (car_id = 16)
    (16, N'/images/Mitsubishi_Xpander_2022_5.jpg', N'Hình chính Mitsubishi Xpander 2022', 1),
    (16, N'/images/Mitsubishi_Xpander_2022_8.jpg', N'Hình phụ Mitsubishi Xpander 2022', 0),
    (16, N'/images/Mitsubishi_Xpander_2022_7.jpg', N'Hình phụ Mitsubishi Xpander 2022', 0),
    (16, N'/images/Mitsubishi_Xpander_2022_6.jpg', N'Hình phụ Mitsubishi Xpander 2022', 0),
    (16, N'/images/Mitsubishi_Xpander_2022_13.jpg', N'Hình phụ Mitsubishi Xpander 2022', 0),
    -- Mitsubishi Xpander 2019 (car_id = 17)
    (17, N'/images/Mitsubishi_Xpander_2019_15.jpg', N'Hình chính Mitsubishi Xpander 2019', 1),
    (17, N'/images/Mitsubishi_Xpander_2019_14.jpg', N'Hình phụ Mitsubishi Xpander 2019', 0),
    (17, N'/images/Mitsubishi_Xpander_2019_13.jpg', N'Hình phụ Mitsubishi Xpander 2019', 0),
    (17, N'/images/Mitsubishi_Xpander_2019_8.jpg', N'Hình phụ Mitsubishi Xpander 2019', 0),
    (17, N'/images/Mitsubishi_Xpander_2019_4.jpg', N'Hình phụ Mitsubishi Xpander 2019', 0),
    -- Mitsubishi Xforce 2024 (car_id = 18)
    (18, N'/images/Mitsubishi_Xforce_2024_9.jpg', N'Hình chính Mitsubishi Xforce 2024', 1),
    (18, N'/images/Mitsubishi_Xforce_2024_8.jpg', N'Hình phụ Mitsubishi Xforce 2024', 0),
    (18, N'/images/Mitsubishi_Xforce_2024_7.jpg', N'Hình phụ Mitsubishi Xforce 2024', 0),
    (18, N'/images/Mitsubishi_Xforce_2024_6.jpg', N'Hình phụ Mitsubishi Xforce 2024', 0),
    (18, N'/images/Mitsubishi_Xforce_2024_5.jpg', N'Hình phụ Mitsubishi Xforce 2024', 0),
    -- Mitsubishi Triton 2017 (car_id = 19)
    (19, N'/images/Mitsubishi_Triton_2017_6.jpg', N'Hình chính Mitsubishi Triton 2017', 1),
    (19, N'/images/Mitsubishi_Triton_2017_12.jpg', N'Hình phụ Mitsubishi Triton 2017', 0),
    (19, N'/images/Mitsubishi_Triton_2017_8.jpg', N'Hình phụ Mitsubishi Triton 2017', 0),
    (19, N'/images/Mitsubishi_Triton_2017_7.jpg', N'Hình phụ Mitsubishi Triton 2017', 0),
    (19, N'/images/Mitsubishi_Triton_2017_13.jpg', N'Hình phụ Mitsubishi Triton 2017', 0),
    -- Mitsubishi Outlander 2018 (car_id = 20)
    (20, N'/images/Mitsubishi_Outlander_2018_6.jpg', N'Hình chính Mitsubishi Outlander 2018', 1),
    (20, N'/images/Mitsubishi_Outlander_2018_7.jpg', N'Hình phụ Mitsubishi Outlander 2018', 0),
    (20, N'/images/Mitsubishi_Outlander_2018_14.jpg', N'Hình phụ Mitsubishi Outlander 2018', 0),
    (20, N'/images/Mitsubishi_Outlander_2018_5.jpg', N'Hình phụ Mitsubishi Outlander 2018', 0),
    -- MG5 2024 (car_id = 21)
    (21, N'/images/MG5_2024_7.jpg', N'Hình chính MG5 2024', 1),
    (21, N'/images/MG5_2024_12.jpg', N'Hình phụ MG5 2024', 0),
    (21, N'/images/MG5_2024_6.jpg', N'Hình phụ MG5 2024', 0),
    (21, N'/images/MG5_2024_4.jpg', N'Hình phụ MG5 2024', 0),
    -- MG5 2022 (car_id = 22)
    (22, N'/images/MG5_2022_5.jpg', N'Hình chính MG5 2022', 1),
    (22, N'/images/MG5_2022_8.jpg', N'Hình phụ MG5 2022', 0),
    (22, N'/images/MG5_2022_7.jpg', N'Hình phụ MG5 2022', 0),
    (22, N'/images/MG5_2022_6.jpg', N'Hình phụ MG5 2022', 0),
    (22, N'/images/MG5_2022_11.jpg', N'Hình phụ MG5 2022', 0),
    -- MG ZS 2022 (car_id = 23)
    (23, N'/images/MG_ZS_2022_7.jpg', N'Hình chính MG ZS 2022', 1),
    (23, N'/images/MG_ZS_2022_8.jpg', N'Hình phụ MG ZS 2022', 0),
    (23, N'/images/MG_ZS_2022_9.jpg', N'Hình phụ MG ZS 2022', 0),
    (23, N'/images/MG_ZS_2022_6.jpg', N'Hình phụ MG ZS 2022', 0),
    (23, N'/images/MG_ZS_2022_2.jpg', N'Hình phụ MG ZS 2022', 0),
    -- MG ZS 1.5L 2024 (car_id = 24)
    (24, N'/images/MG_ZS_15L_2024_8.jpg', N'Hình chính MG ZS 1.5L 2024', 1),
    (24, N'/images/MG_ZS_15L_2024_7.jpg', N'Hình phụ MG ZS 1.5L 2024', 0),
    (24, N'/images/MG_ZS_15L_2024_6.jpg', N'Hình phụ MG ZS 1.5L 2024', 0),
    (24, N'/images/MG_ZS_15L_2024_3.jpg', N'Hình phụ MG ZS 1.5L 2024', 0),
    -- MG RX5 2023 (car_id = 25)
    (25, N'/images/MG_RX5_2023_7.jpg', N'Hình chính MG RX5 2023', 1),
    (25, N'/images/MG_RX5_2023_8.jpg', N'Hình phụ MG RX5 2023', 0),
    (25, N'/images/MG_RX5_2023_10.jpg', N'Hình phụ MG RX5 2023', 0),
    (25, N'/images/MG_RX5_2023_6.jpg', N'Hình phụ MG RX5 2023', 0),
    (25, N'/images/MG_RX5_2023_4.jpg', N'Hình phụ MG RX5 2023', 0),
    -- Mercedes E200 2023 (car_id = 26)
    (26, N'/images/MERCEDES_E200_3.jpg', N'Hình chính Mercedes E200 2023', 1),
    (26, N'/images/MERCEDES_E200_2.jpg', N'Hình phụ Mercedes E200 2023', 0),
    (26, N'/images/MERCEDES_E200_1.jpg', N'Hình phụ Mercedes E200 2023', 0),
    -- Mazda CX-8 2020 (car_id = 27)
    (27, N'/images/Mazda_CX8_2020_15.jpg', N'Hình chính Mazda CX-8 2020', 1),
    (27, N'/images/Mazda_CX8_2020_10.jpg', N'Hình phụ Mazda CX-8 2020', 0),
    (27, N'/images/Mazda_CX8_2020_8.jpg', N'Hình phụ Mazda CX-8 2020', 0),
    (27, N'/images/Mazda_CX8_2020_7.jpg', N'Hình phụ Mazda CX-8 2020', 0),
    (27, N'/images/Mazda_CX8_2020_6.jpg', N'Hình phụ Mazda CX-8 2020', 0),
    -- Mazda CX-3 2021 (car_id = 28)
    (28, N'/images/Mazda_CX3_2021_8.jpg', N'Hình chính Mazda CX-3 2021', 1),
    (28, N'/images/Mazda_CX3_2021_12.jpg', N'Hình phụ Mazda CX-3 2021', 0),
    (28, N'/images/Mazda_CX3_2021_13.jpg', N'Hình phụ Mazda CX-3 2021', 0),
    (28, N'/images/Mazda_CX3_2021_7.jpg', N'Hình phụ Mazda CX-3 2021', 0),
    (28, N'/images/Mazda_CX3_2021_6.jpg', N'Hình phụ Mazda CX-3 2021', 0),
    -- Mazda 6 2017 (car_id = 29)
    (29, N'/images/Mazda_6_2017_8.jpg', N'Hình chính Mazda 6 2017', 1),
    (29, N'/images/Mazda_6_2017_9.jpg', N'Hình phụ Mazda 6 2017', 0),
    (29, N'/images/Mazda_6_2017_7.jpg', N'Hình phụ Mazda 6 2017', 0),
    (29, N'/images/Mazda_6_2017_6.jpg', N'Hình phụ Mazda 6 2017', 0),
    (29, N'/images/Mazda_6_2017_5.jpg', N'Hình phụ Mazda 6 2017', 0),
    -- Mazda 3 2021 (car_id = 30)
    (30, N'/images/Mazda_3_2021_13.jpg', N'Hình chính Mazda 3 2021', 1),
    (30, N'/images/Mazda_3_2021_8.jpg', N'Hình phụ Mazda 3 2021', 0),
    (30, N'/images/Mazda_3_2021_7.jpg', N'Hình phụ Mazda 3 2021', 0),
    (30, N'/images/Mazda_3_2021_6.jpg', N'Hình phụ Mazda 3 2021', 0),
    (30, N'/images/Mazda_3_2021_5.jpg', N'Hình phụ Mazda 3 2021', 0),
    -- KIA Sorento 2021 (car_id = 31)
    (31, N'/images/KIA_Sorento_2021_5.jpg', N'Hình chính KIA Sorento 2021', 1),
    (31, N'/images/KIA_Sorento_2021_8.jpg', N'Hình phụ KIA Sorento 2021', 0),
    (31, N'/images/KIA_Sorento_2021_7.jpg', N'Hình phụ KIA Sorento 2021', 0),
    (31, N'/images/KIA_Sorento_2021_6.jpg', N'Hình phụ KIA Sorento 2021', 0),
    (31, N'/images/KIA_Sorento_2021_11.jpg', N'Hình phụ KIA Sorento 2021', 0),
    -- KIA Sedona 2021 (car_id = 32)
    (32, N'/images/KIA_SEDONA_3.jpg', N'Hình chính KIA Sedona 2021', 1),
    -- KIA Cerato 2021 (car_id = 33)
    (33, N'/images/KIA_CERATO_3.jpg', N'Hình chính KIA Cerato 2021', 1),
    -- KIA Carnival 2024 (car_id = 34)
    (34, N'/images/KIA_Carnival_2024_6.jpg', N'Hình chính KIA Carnival 2024', 1),
    (34, N'/images/KIA_Carnival_2024_8.jpg', N'Hình phụ KIA Carnival 2024', 0),
    (34, N'/images/KIA_Carnival_2024_7.jpg', N'Hình phụ KIA Carnival 2024', 0),
    (34, N'/images/KIA_Carnival_2024_11.jpg', N'Hình phụ KIA Carnival 2024', 0),
    (34, N'/images/KIA_Carnival_2024_2.jpg', N'Hình phụ KIA Carnival 2024', 0),
    -- KIA Carnival 2023 (car_id = 35)
    (35, N'/images/KIA_Carnival_2023_10.jpg', N'Hình chính KIA Carnival 2023', 1),
    (35, N'/images/KIA_Carnival_2023_7.jpg', N'Hình phụ KIA Carnival 2023', 0),
    (35, N'/images/KIA_Carnival_2023_6.jpg', N'Hình phụ KIA Carnival 2023', 0),
	(35, N'/images/KIA_Carnival_2023_5.jpg', N'Hình phụ KIA Carnival 2023', 0),
    -- KIA Carnival 2022 (car_id = 36)
    (36, N'/images/KIA_Carnival_2022_6.jpg', N'Hình chính KIA Carnival 2022', 1),
    (36, N'/images/KIA_Carnival_2022_12.jpg', N'Hình phụ KIA Carnival 2022', 0),
    (36, N'/images/KIA_Carnival_2022_7.jpg', N'Hình phụ KIA Carnival 2022', 0),
    (36, N'/images/KIA_Carnival_2022_13.jpg', N'Hình phụ KIA Carnival 2022', 0),
    -- KIA Carens 2024 (car_id = 37)
    (37, N'/images/KIA_Carens_2024_8.jpg', N'Hình chính KIA Carens 2024', 1),
    (37, N'/images/KIA_Carens_2024_14.jpg', N'Hình phụ KIA Carens 2024', 0),
    (37, N'/images/KIA_Carens_2024_10.jpg', N'Hình phụ KIA Carens 2024', 0),
    (37, N'/images/KIA_Carens_2024_15.jpg', N'Hình phụ KIA Carens 2024', 0),
    (37, N'/images/KIA_Carens_2024_2.jpg', N'Hình phụ KIA Carens 2024', 0),
    -- KIA Carens 2023 (car_id = 38)
    (38, N'/images/KIA_Carens_2023_8.jpg', N'Hình chính KIA Carens 2023', 1),
    (38, N'/images/KIA_Carens_2023_10.jpg', N'Hình phụ KIA Carens 2023', 0),
    (38, N'/images/KIA_Carens_2023_7.jpg', N'Hình phụ KIA Carens 2023', 0),
    (38, N'/images/KIA_Carens_2023_6.jpg', N'Hình phụ KIA Carens 2023', 0),
    (38, N'/images/KIA_Carens_2023_5.jpg', N'Hình phụ KIA Carens 2023', 0),
    -- Hyundai Stargazer 2025 (car_id = 39)
    (39, N'/images/Hyundai_Stargazer_2025_13.jpg', N'Hình chính Hyundai Stargazer 2025', 1),
    (39, N'/images/Hyundai_Stargazer_2025_8.jpg', N'Hình phụ Hyundai Stargazer 2025', 0),
    (39, N'/images/Hyundai_Stargazer_2025_7.jpg', N'Hình phụ Hyundai Stargazer 2025', 0),
    (39, N'/images/Hyundai_Stargazer_2025_6.jpg', N'Hình phụ Hyundai Stargazer 2025', 0),
    (39, N'/images/Hyundai_Stargazer_2025_5.jpg', N'Hình phụ Hyundai Stargazer 2025', 0),
    -- Hyundai Stargazer 2024 (car_id = 40)
    (40, N'/images/Hyundai_Stargazer_2024_7.jpg', N'Hình chính Hyundai Stargazer 2024', 1),
    (40, N'/images/Hyundai_Stargazer_2024_8.jpg', N'Hình phụ Hyundai Stargazer 2024', 0),
    (40, N'/images/Hyundai_Stargazer_2024_6.jpg', N'Hình phụ Hyundai Stargazer 2024', 0),
    (40, N'/images/Hyundai_Stargazer_2024_2.jpg', N'Hình phụ Hyundai Stargazer 2024', 0),
    -- Hyundai Grand i10 2022 (car_id = 41)
    (41, N'/images/Hyundai_Grand_I10_2022_5.jpg', N'Hình chính Hyundai Grand i10 2022', 1),
    (41, N'/images/Hyundai_Grand_I10_2022_9.jpg', N'Hình phụ Hyundai Grand i10 2022', 0),
    (41, N'/images/Hyundai_Grand_I10_2022_6.jpg', N'Hình phụ Hyundai Grand i10 2022', 0),
    (41, N'/images/Hyundai_Grand_I10_2022_14.jpg', N'Hình phụ Hyundai Grand i10 2022', 0),
    -- Hyundai Custin 2024 (car_id = 42)
    (42, N'/images/Hyundai_Custin_2024_8.jpg', N'Hình chính Hyundai Custin 2024', 1),
    (42, N'/images/Hyundai_Custin_2024_9.jpg', N'Hình phụ Hyundai Custin 2024', 0),
    (42, N'/images/Hyundai_Custin_2024_7.jpg', N'Hình phụ Hyundai Custin 2024', 0),
    (42, N'/images/Hyundai_Custin_2024_6.jpg', N'Hình phụ Hyundai Custin 2024', 0),
    (42, N'/images/Hyundai_Custin_2024_5.jpg', N'Hình phụ Hyundai Custin 2024', 0),
    -- Hyundai Accent 2024 (car_id = 43)
    (43, N'/images/Hyundai_Accent_2024_13.jpg', N'Hình chính Hyundai Accent 2024', 1),
    (43, N'/images/Hyundai_Accent_2024_8.jpg', N'Hình phụ Hyundai Accent 2024', 0),
    (43, N'/images/Hyundai_Accent_2024_7.jpg', N'Hình phụ Hyundai Accent 2024', 0),
    (43, N'/images/Hyundai_Accent_2024_6.jpg', N'Hình phụ Hyundai Accent 2024', 0),
    (43, N'/images/Hyundai_Accent_2024_5.jpg', N'Hình phụ Hyundai Accent 2024', 0),
    -- Hyundai Accent 2020 (car_id = 44)
    (44, N'/images/Hyundai_Accent_2020_7.jpg', N'Hình chính Hyundai Accent 2020', 1),
    (44, N'/images/Hyundai_Accent_2020_9.jpg', N'Hình phụ Hyundai Accent 2020', 0),
    (44, N'/images/Hyundai_Accent_2020_8.jpg', N'Hình phụ Hyundai Accent 2020', 0),
    (44, N'/images/Hyundai_Accent_2020_10.jpg', N'Hình phụ Hyundai Accent 2020', 0),
    (44, N'/images/Hyundai_Accent_2020_6.jpg', N'Hình phụ Hyundai Accent 2020', 0),
    -- Hyundai Elantra 2021 (car_id = 45)
    (45, N'/images/HUYNDAI_ELANTRA_3.jpg', N'Hình chính Hyundai Elantra 2021', 1),
    -- Honda Civic 2020 (car_id = 46)
    (46, N'/images/Honda_Civic_2020_6.jpg', N'Hình chính Honda Civic 2020', 1),
    (46, N'/images/Honda_Civic_2020_9.jpg', N'Hình phụ Honda Civic 2020', 0),
    (46, N'/images/Honda_Civic_2020_12.jpg', N'Hình phụ Honda Civic 2020', 0),
    (46, N'/images/Honda_Civic_2020_5.jpg', N'Hình phụ Honda Civic 2020', 0),
    -- Honda City 2018 (car_id = 47)
    (47, N'/images/Honda_City_2018_2.jpg', N'Hình chính Honda City 2018', 1),
    (47, N'/images/Honda_City_2018_8.jpg', N'Hình phụ Honda City 2018', 0),
    (47, N'/images/Honda_City_2018_7.jpg', N'Hình phụ Honda City 2018', 0),
    (47, N'/images/Honda_City_2018_4.jpg', N'Hình phụ Honda City 2018', 0),
    (47, N'/images/Honda_City_2018_13.jpg', N'Hình phụ Honda City 2018', 0),
    -- Honda BR-V L 2024 (car_id = 48)
    (48, N'/images/Honda_BRV_L_2024_8.jpg', N'Hình chính Honda BR-V L 2024', 1),
    (48, N'/images/Honda_BRV_L_2024_11.jpg', N'Hình phụ Honda BR-V L 2024', 0),
    (48, N'/images/Honda_BRV_L_2024_7.jpg', N'Hình phụ Honda BR-V L 2024', 0),
    (48, N'/images/Honda_BRV_L_2024_6.jpg', N'Hình phụ Honda BR-V L 2024', 0),
    (48, N'/images/Honda_BRV_L_2024_2.jpg', N'Hình phụ Honda BR-V L 2024', 0),
    -- Honda BR-V G 2024 (car_id = 49)
    (49, N'/images/Honda_BRV_G_2024_7.jpg', N'Hình chính Honda BR-V G 2024', 1),
    (49, N'/images/Honda_BRV_G_2024_4.jpg', N'Hình phụ Honda BR-V G 2024', 0),
	(49, N'/images/Honda_BRV_G_2024_15.jpg', N'Hình phụ Honda BR-V G 2024', 0),
	(49, N'/images/Honda_BRV_G_2024_4.jpg', N'Hình phụ Honda BR-V G 2024', 0),
	(49, N'/images/Honda_BRV_G_2024_12.jpg', N'Hình phụ Honda BR-V G 2024', 0),
    -- Ford Everest (car_id = 50)
    (50, N'/images/FORD_EVEREST_2.jpg', N'Hình chính Ford Everest', 1),
    -- Hyundai Accent 2020 (car_id = 51)
    (51, N'/images/HUYNDAI_ACCENT_1.png', N'Hình chính Hyundai Accent 2020', 1),
    (51, N'/images/HUYNDAI_ACCENT_2.png', N'Hình phụ Hyundai Accent 2020', 0),
    (51, N'/images/HUYNDAI_ACCENT_3.png', N'Hình phụ Hyundai Accent 2020', 0),
    (51, N'/images/HUYNDAI_ACCENT_4.png', N'Hình phụ Hyundai Accent 2020', 0),
	(51, N'/images/HUYNDAI_ACCENT_5.png', N'Hình phụ Hyundai Accent 2020', 0),
    -- Hyundai Grand i10 2022 (car_id = 52)
    (52, N'/images/HUYNDAI_GRAND_i10_2.png', N'Hình chính Hyundai Grand i10 2022', 1),
    -- KIA Carnival 2023 (car_id = 53)
    (53, N'/images/KIA_CARNIVAL_1.png', N'Hình chính KIA Carnival 2023', 1),
    -- KIA Carnival 2022 (car_id = 54)
    (54, N'/images/KIA_CARNIVAL_2.png', N'Hình chính KIA Carnival 2022', 1),
    (54, N'/images/KIA_CARNIVAL_5.png', N'Hình phụ KIA Carnival 2022', 0),
    (54, N'/images/KIA_CARNIVAL_3.png', N'Hình phụ KIA Carnival 2022', 0),
    (54, N'/images/KIA_CARNIVAL_4.png', N'Hình phụ KIA Carnival 2022', 0),
    -- Mazda 2 2021 (car_id = 55)
    (55, N'/images/MAZDA_2_1.png', N'Hình chính Mazda 2 2021', 1),
    (55, N'/images/MAZDA_2_2.png', N'Hình phụ Mazda 2 2021', 0),
    (55, N'/images/MAZDA_2_3.png', N'Hình phụ Mazda 2 2021', 0),
    (55, N'/images/MAZDA_2_4.png', N'Hình phụ Mazda 2 2021', 0),
    -- Mitsubishi Xpander Cross 2023 (car_id = 56)
    (56, N'/images/Mitsubishi_Xpander_Cross_2023_14.png', N'Hình chính Mitsubishi Xpander Cross 2023', 1),
    (56, N'/images/Mitsubishi_Xpander_Cross_2023_7.png', N'Hình phụ Mitsubishi Xpander Cross 2023', 0),
    (56, N'/images/Mitsubishi_Xpander_Cross_2023_6.png', N'Hình phụ Mitsubishi Xpander Cross 2023', 0),
    (56, N'/images/Mitsubishi_Xpander_Cross_2023_4.png', N'Hình phụ Mitsubishi Xpander Cross 2023', 0),
    -- Suzuki Ertiga 2022 (car_id = 57)
    (57, N'/images/Suzuki_Ertiga_2022_1.jpg', N'Hình chính Suzuki Ertiga 2022', 1),
	(57, N'/images/Suzuki_Ertiga_2022_11.jpg', N'Hình chính Suzuki Ertiga 2022', 0),
	(57, N'/images/Suzuki_Ertiga_2022_12.jpg', N'Hình chính Suzuki Ertiga 2022', 0),
	(57, N'/images/Suzuki_Ertiga_2022_13.jpg', N'Hình chính Suzuki Ertiga 2022', 0),
    -- Toyota Corolla Cross 2022 (car_id = 58)
    (58, N'/images/TOYOTA_CROSS_1.png', N'Hình chính Toyota Corolla Cross 2022', 1),
    -- VinFast Lux A 2.0 2021 (car_id = 59)
    (59, N'/images/VinFast_Lux_AB_20_2021_2.png', N'Hình chính VinFast Lux AB 2.0 2021', 1),
    (59, N'/images/VinFast_Lux_AB_20_2021_14.png', N'Hình phụ VinFast Lux AB 2.0 2021', 0),
    (59, N'/images/VinFast_Lux_AB_20_2021_17.png', N'Hình phụ VinFast Lux AB 2.0 2021', 0),
    -- VinFast VF8 2022 (car_id = 60)
    (60, N'/images/VinFast_VF8_2022_1.webp', N'Hình chính VinFast VF8 2022', 1),
    (60, N'/images/VinFast_VF8_2022_2.webp', N'Hình phụ VinFast VF8 2022', 0),
	(60, N'/images/VinFast_VF8_2022_3.webp', N'Hình phụ VinFast VF8 2022', 0),
	(60, N'/images/VinFast_VF8_2022_4.webp', N'Hình phụ VinFast VF8 2022', 0),
    -- Honda BR-V G 2024 (car_id = 61)
    (61, N'/images/Honda_BRV_G_2024_7.jpg', N'Hình chính Honda BR-V G 2024', 1),
    (61, N'/images/Honda_BRV_G_2024_4.jpeg', N'Hình phụ Honda BR-V G 2024', 0),
	(61, N'/images/Honda_BRV_G_2024_2.jpeg', N'Hình phụ Honda BR-V G 2024', 0),
	(61, N'/images/Honda_BRV_G_2024_15.jpg', N'Hình phụ Honda BR-V G 2024', 0),
    (61, N'/images/Honda_BRV_G_2024_12.jpeg', N'Hình phụ Honda BR-V G 2024', 0),
    -- Toyota Corolla Cross 2022 (car_id = 62)
    (62, N'/images/TOYOTA_CROSS_2.jpeg', N'Hình chính Toyota Corolla Cross 2022', 1),
    -- Toyota Corolla Cross 2022 (car_id = 63)
    (63, N'/images/TOYOTA_CROSS_3.jpg', N'Hình chính Toyota Corolla Cross 2022', 1),
    -- Mazda 3 2021 (car_id = 64)
    (64, N'/images/MAZDA_3_3.jpg', N'Hình chính Mazda 3 2021', 1),
    (64, N'/images/MAZDA_3_2.jpg', N'Hình phụ Mazda 3 2021', 0),
    -- KIA Sedona 2021 (car_id = 65)
    (65, N'/images/KIA_SEDONA_2.jpg', N'Hình chính KIA Sedona 2021', 1),
    -- KIA Sedona 2021 (car_id = 66)
    (66, N'/images/KIA_SEDONA_1.jpg', N'Hình chính KIA Sedona 2021', 1),
    -- KIA Cerato 2021 (car_id = 67)
    (67, N'/images/KIA_CERATO_2.jpg', N'Hình chính KIA Cerato 2021', 1),
    -- KIA Carnival 2022 (car_id = 68)
    (68, N'/images/KIA_CARNIVAL_1.png', N'Hình chính KIA Carnival 2022', 1),
    -- Hyundai Grand i10 2022 (car_id = 69)
    (69, N'/images/HUYNDAI_GRAND_i10_2.png', N'Hình chính Hyundai Grand i10 2022', 1),
    (69, N'/images/HUYNDAI_GRAND_i10_1.png', N'Hình phụ Hyundai Grand i10 2022', 0),
    -- Hyundai Accent 2020 (car_id = 70)
    (70, N'/images/HUYNDAI_ACCENT_5.jpg', N'Hình chính Hyundai Accent 2020', 1),
    (70, N'/images/HUYNDAI_ACCENT_4.jpg', N'Hình phụ Hyundai Accent 2020', 0),
    (70, N'/images/HUYNDAI_ACCENT_3.jpg', N'Hình phụ Hyundai Accent 2020', 0),
    (70, N'/images/HUYNDAI_ACCENT_2.jpg', N'Hình phụ Hyundai Accent 2020', 0),
    (70, N'/images/HUYNDAI_ACCENT_1.jpg', N'Hình phụ Hyundai Accent 2020', 0),
    -- Ford Everest (car_id = 71)
    (71, N'/images/FORD_EVEREST_1.jpg', N'Hình chính Ford Everest', 1);
GO

INSERT INTO registration_requests (
    full_name,
    id_number,
    address,
    phone_number,
    email,
    password,
    car_documents,
    business_license,
    driver_license,
    status,
    created_at,
    updated_at
) VALUES (
    N'Nguyễn Văn D',
    '012345670',
    N'123 Đường ABC, Quận 1, TP.HCM',
    '+84901234580',
    'nguyenvand@example.com',
    'Test@word183',
    'uploads/test_car_doc.pdf',
    'uploads/test_business_license.pdf',
    'uploads/test_driver_license.pdf',
    'pending',
    GETDATE(),
    GETDATE()
);

  UPDATE registration_requests SET status = 'approved' WHERE id = 1;

-- Tháng 3 trước: 1 booking cho mỗi xe
INSERT INTO Booking (customer_id, car_id, region_id, start_date, end_date, pickup_location, dropoff_location, status_id, seat_number, deposit_amount, created_at)
VALUES
(101, 5, 1, DATEADD(MONTH, -3, GETDATE()), DATEADD(MONTH, -3, GETDATE()), N'Hà Nội', N'Hải Phòng', 4, 5, 500000, DATEADD(MONTH, -3, GETDATE())),
(201, 16, 1, DATEADD(MONTH, -3, GETDATE()), DATEADD(MONTH, -3, GETDATE()), N'Hà Nội', N'Hải Dương', 4, 5, 500000, DATEADD(MONTH, -3, GETDATE()));

-- Tháng 2 trước: 2 booking cho mỗi xe
INSERT INTO Booking (customer_id, car_id, region_id, start_date, end_date, pickup_location, dropoff_location, status_id, seat_number, deposit_amount, created_at)
VALUES
(102, 5, 1, DATEADD(MONTH, -2, GETDATE()), DATEADD(MONTH, -2, GETDATE()), N'Hà Nội', N'Hải Phòng', 4, 5, 500000, DATEADD(MONTH, -2, GETDATE())),
(103, 5, 1, DATEADD(MONTH, -2, GETDATE()) + 1, DATEADD(MONTH, -2, GETDATE()) + 1, N'Hà Nội', N'Hải Phòng', 4, 5, 500000, DATEADD(MONTH, -2, GETDATE()) + 1),
(202, 16, 1, DATEADD(MONTH, -2, GETDATE()), DATEADD(MONTH, -2, GETDATE()), N'Hà Nội', N'Hải Dương', 4, 5, 500000, DATEADD(MONTH, -2, GETDATE())),
(203, 16, 1, DATEADD(MONTH, -2, GETDATE()) + 1, DATEADD(MONTH, -2, GETDATE()) + 1, N'Hà Nội', N'Hải Dương', 4, 5, 500000, DATEADD(MONTH, -2, GETDATE()) + 1);

-- Tháng trước: 3 booking cho mỗi xe
INSERT INTO Booking (customer_id, car_id, region_id, start_date, end_date, pickup_location, dropoff_location, status_id, seat_number, deposit_amount, created_at)
VALUES
(104, 5, 1, DATEADD(MONTH, -1, GETDATE()), DATEADD(MONTH, -1, GETDATE()), N'Hà Nội', N'Hải Phòng', 4, 5, 500000, DATEADD(MONTH, -1, GETDATE())),
(105, 5, 1, DATEADD(MONTH, -1, GETDATE()) + 1, DATEADD(MONTH, -1, GETDATE()) + 1, N'Hà Nội', N'Hải Phòng', 4, 5, 500000, DATEADD(MONTH, -1, GETDATE()) + 1),
(106, 5, 1, DATEADD(MONTH, -1, GETDATE()) + 2, DATEADD(MONTH, -1, GETDATE()) + 2, N'Hà Nội', N'Hải Phòng', 4, 5, 500000, DATEADD(MONTH, -1, GETDATE()) + 2),
(204, 16, 1, DATEADD(MONTH, -1, GETDATE()), DATEADD(MONTH, -1, GETDATE()), N'Hà Nội', N'Hải Dương', 4, 5, 500000, DATEADD(MONTH, -1, GETDATE())),
(205, 16, 1, DATEADD(MONTH, -1, GETDATE()) + 1, DATEADD(MONTH, -1, GETDATE()) + 1, N'Hà Nội', N'Hải Dương', 4, 5, 500000, DATEADD(MONTH, -1, GETDATE()) + 1),
(206, 16, 1, DATEADD(MONTH, -1, GETDATE()) + 2, DATEADD(MONTH, -1, GETDATE()) + 2, N'Hà Nội', N'Hải Dương', 4, 5, 500000, DATEADD(MONTH, -1, GETDATE()) + 2);

-- Tháng này: 4 booking cho mỗi xe
INSERT INTO Booking (customer_id, car_id, region_id, start_date, end_date, pickup_location, dropoff_location, status_id, seat_number, deposit_amount, created_at)
VALUES
(107, 5, 1, GETDATE(), GETDATE(), N'Hà Nội', N'Hải Phòng', 4, 5, 500000, GETDATE()),
(108, 5, 1, GETDATE() + 1, GETDATE() + 1, N'Hà Nội', N'Hải Phòng', 4, 5, 500000, GETDATE() + 1),
(109, 5, 1, GETDATE() + 2, GETDATE() + 2, N'Hà Nội', N'Hải Phòng', 4, 5, 500000, GETDATE() + 2),
(110, 5, 1, GETDATE() + 3, GETDATE() + 3, N'Hà Nội', N'Hải Phòng', 4, 5, 500000, GETDATE() + 3),
(207, 16, 1, GETDATE(), GETDATE(), N'Hà Nội', N'Hải Dương', 4, 5, 500000, GETDATE()),
(208, 16, 1, GETDATE() + 1, GETDATE() + 1, N'Hà Nội', N'Hải Dương', 4, 5, 500000, GETDATE() + 1),
(209, 16, 1, GETDATE() + 2, GETDATE() + 2, N'Hà Nội', N'Hải Dương', 4, 5, 500000, GETDATE() + 2),
(210, 16, 1, GETDATE() + 3, GETDATE() + 3, N'Hà Nội', N'Hải Dương', 4, 5, 500000, GETDATE() + 3);

-- BookingFinancials cho car_id = 5
INSERT INTO BookingFinancials (booking_id, total_fare, applied_discount, late_fee_amount, late_days, is_deleted)
VALUES
(1, 1500000, 0, 0, 0, 0),
(2, 1550000, 0, 0, 0, 0),
(3, 1600000, 0, 0, 0, 0),
(4, 1650000, 0, 0, 0, 0),
(5, 1700000, 0, 0, 0, 0),
(6, 1750000, 0, 0, 0, 0),
(7, 1800000, 0, 0, 0, 0),
(8, 1850000, 0, 0, 0, 0),
(9, 1900000, 0, 0, 0, 0),
(10, 1950000, 0, 0, 0, 0);

-- BookingFinancials cho car_id = 16
INSERT INTO BookingFinancials (booking_id, total_fare, applied_discount, late_fee_amount, late_days, is_deleted)
VALUES
(11, 2000000, 0, 0, 0, 0),
(12, 2050000, 0, 0, 0, 0),
(13, 2100000, 0, 0, 0, 0),
(14, 2150000, 0, 0, 0, 0),
(15, 2200000, 0, 0, 0, 0),
(16, 2250000, 0, 0, 0, 0),
(17, 2300000, 0, 0, 0, 0),
(18, 2350000, 0, 0, 0, 0),
(19, 2400000, 0, 0, 0, 0),
(20, 2450000, 0, 0, 0, 0);

-- Ví dụ cho booking_id = 1 (car_id=5)
INSERT INTO Payment (booking_id, amount, region_id, payment_method, payment_status_id, payment_type, payment_date)
VALUES
(1, 500000, 1, 'cash', 15, 'deposit', DATEADD(MINUTE, 1, (SELECT created_at FROM Booking WHERE booking_id=1))),
(1, 1000000, 1, 'momo', 15, 'full_payment', DATEADD(MINUTE, 2, (SELECT created_at FROM Booking WHERE booking_id=1))),
(1, 100000, 1, 'vnpay', 15, 'refund', DATEADD(MINUTE, 3, (SELECT created_at FROM Booking WHERE booking_id=1))),
(1, 1400000, 1, 'cash', 15, 'payout', DATEADD(MINUTE, 4, (SELECT created_at FROM Booking WHERE booking_id=1)));

-- Lặp lại cho tất cả booking_id còn lại (2-20), chỉ cần thay số tiền, phương thức, payment_date cho đa dạng.

DECLARE @i INT = 0, @month INT, @booking_id INT, @car_id INT, @customer_id INT;
SET @car_id = 16; -- hoặc 16
SET @customer_id = 70; -- tăng dần cho mỗi booking

WHILE @i < 6
BEGIN
    SET @month = -6 + @i;
    INSERT INTO Booking (
        customer_id, car_id, region_id, start_date, end_date, 
        pickup_location, dropoff_location, status_id, seat_number, 
        deposit_amount, created_at,
        supplier_delivery_confirm, customer_receive_confirm, 
        customer_return_confirm, supplier_return_confirm
    )
    VALUES (
        @customer_id + @i, @car_id, 1, 
        DATEADD(MONTH, @month, GETDATE()), 
        DATEADD(MONTH, @month, GETDATE()) + 1, 
        N'Hà Nội', N'Hải Phòng', 4, 5, 500000, 
        DATEADD(MONTH, @month, GETDATE()),
        1, 1, 1, 1  -- 4 cột confirm đều = 1
    );

    SET @booking_id = SCOPE_IDENTITY();

    INSERT INTO BookingFinancials (booking_id, total_fare, applied_discount, late_fee_amount, late_days, is_deleted)
    VALUES (@booking_id, 1500000 + @i * 50000, 0, 0, 0, 0);

    INSERT INTO Payment (booking_id, amount, region_id, payment_method, payment_status_id, payment_type, payment_date)
    VALUES
    (@booking_id, 500000, 1, 'cash', 15, 'deposit', DATEADD(MINUTE, 1, (SELECT created_at FROM Booking WHERE booking_id=@booking_id))),
    (@booking_id, 1000000, 1, 'momo', 15, 'full_payment', DATEADD(MINUTE, 2, (SELECT created_at FROM Booking WHERE booking_id=@booking_id))),
    (@booking_id, 100000, 1, 'vnpay', 15, 'refund', DATEADD(MINUTE, 3, (SELECT created_at FROM Booking WHERE booking_id=@booking_id))),
    (@booking_id, 1400000, 1, 'cash', 15, 'payout', DATEADD(MINUTE, 4, (SELECT created_at FROM Booking WHERE booking_id=@booking_id)));

    SET @i = @i + 1;
END
-- Bỏ điều kiện CHECK CHK_Start_Date
ALTER TABLE Booking DROP CONSTRAINT CHK_Start_Date;
select * from Booking