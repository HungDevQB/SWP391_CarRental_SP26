using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace CarRental.API.Services;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration config)
    {
        var account = new Account(
            config["Cloudinary:CloudName"],
            config["Cloudinary:ApiKey"],
            config["Cloudinary:ApiSecret"]);
        _cloudinary = new Cloudinary(account);
        _cloudinary.Api.Secure = true;
    }

    public async Task<string> UploadAvatarAsync(IFormFile file, int userId)
    {
        using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            PublicId = $"avatars/user_{userId}",
            Overwrite = true,
            Transformation = new Transformation()
                .Width(200).Height(200).Crop("fill").Gravity("face")
        };
        var result = await _cloudinary.UploadAsync(uploadParams);
        if (result.Error != null)
            throw new Exception(result.Error.Message);
        return result.SecureUrl.ToString();
    }
}
