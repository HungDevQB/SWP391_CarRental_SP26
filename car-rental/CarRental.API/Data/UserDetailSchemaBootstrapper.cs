using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace CarRental.API.Data;

/// <summary>
/// Đồng bộ bảng dbo.UserDetail với entity khi DB được tạo từ script cũ (thiếu cột).
/// Idempotent — an toàn gọi mỗi lần khởi động API (SQL Server).
/// </summary>
public static class UserDetailSchemaBootstrapper
{
    private const string EnsureSql = """
        IF OBJECT_ID(N'dbo.UserDetail', N'U') IS NULL RETURN;

        IF COL_LENGTH(N'dbo.UserDetail', N'name') IS NOT NULL
            ALTER TABLE dbo.UserDetail ALTER COLUMN name NVARCHAR(100) NULL;
        IF COL_LENGTH(N'dbo.UserDetail', N'address') IS NOT NULL
            ALTER TABLE dbo.UserDetail ALTER COLUMN address NVARCHAR(500) NULL;
        IF COL_LENGTH(N'dbo.UserDetail', N'taxcode') IS NOT NULL
            ALTER TABLE dbo.UserDetail ALTER COLUMN taxcode VARCHAR(20) NULL;

        IF COL_LENGTH(N'dbo.UserDetail', N'date_of_birth') IS NULL
            ALTER TABLE dbo.UserDetail ADD date_of_birth DATETIME2 NULL;
        IF COL_LENGTH(N'dbo.UserDetail', N'gender') IS NULL
            ALTER TABLE dbo.UserDetail ADD gender NVARCHAR(10) NULL;
        IF COL_LENGTH(N'dbo.UserDetail', N'national_id') IS NULL
            ALTER TABLE dbo.UserDetail ADD national_id NVARCHAR(50) NULL;
        IF COL_LENGTH(N'dbo.UserDetail', N'national_id_front_image') IS NULL
            ALTER TABLE dbo.UserDetail ADD national_id_front_image NVARCHAR(500) NULL;
        IF COL_LENGTH(N'dbo.UserDetail', N'national_id_back_image') IS NULL
            ALTER TABLE dbo.UserDetail ADD national_id_back_image NVARCHAR(500) NULL;
        IF COL_LENGTH(N'dbo.UserDetail', N'driving_license') IS NULL
            ALTER TABLE dbo.UserDetail ADD driving_license NVARCHAR(50) NULL;
        IF COL_LENGTH(N'dbo.UserDetail', N'driving_license_front_image') IS NULL
            ALTER TABLE dbo.UserDetail ADD driving_license_front_image NVARCHAR(500) NULL;
        IF COL_LENGTH(N'dbo.UserDetail', N'driving_license_back_image') IS NULL
            ALTER TABLE dbo.UserDetail ADD driving_license_back_image NVARCHAR(500) NULL;
        IF COL_LENGTH(N'dbo.UserDetail', N'avatar') IS NULL
            ALTER TABLE dbo.UserDetail ADD avatar NVARCHAR(500) NULL;
        IF COL_LENGTH(N'dbo.UserDetail', N'is_verified') IS NULL
            ALTER TABLE dbo.UserDetail ADD is_verified BIT NOT NULL CONSTRAINT DF_UserDetail_is_verified DEFAULT 0;
        IF COL_LENGTH(N'dbo.UserDetail', N'created_at') IS NULL
            ALTER TABLE dbo.UserDetail ADD created_at DATETIME2 NOT NULL CONSTRAINT DF_UserDetail_created_at DEFAULT SYSUTCDATETIME();
        IF COL_LENGTH(N'dbo.UserDetail', N'updated_at') IS NULL
            ALTER TABLE dbo.UserDetail ADD updated_at DATETIME2 NOT NULL CONSTRAINT DF_UserDetail_updated_at DEFAULT SYSUTCDATETIME();
        IF COL_LENGTH(N'dbo.UserDetail', N'is_deleted') IS NULL
            ALTER TABLE dbo.UserDetail ADD is_deleted BIT NOT NULL CONSTRAINT DF_UserDetail_is_deleted DEFAULT 0;
        """;

    public static async Task EnsureAsync(DatabaseFacade database, CancellationToken cancellationToken = default)
    {
        try
        {
            await database.ExecuteSqlRawAsync(EnsureSql, cancellationToken);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠ UserDetail schema bootstrap: {ex.Message}");
        }
    }
}
