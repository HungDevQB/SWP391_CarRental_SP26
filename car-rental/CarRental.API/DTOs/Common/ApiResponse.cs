namespace CarRental.API.DTOs.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }
    public int StatusCode { get; set; }

    public static ApiResponse<T> Ok(T data, string? message = null) =>
        new() { Success = true, Data = data, Message = message, StatusCode = 200 };

    public static ApiResponse<T> Fail(string message, int statusCode = 400) =>
        new() { Success = false, Message = message, StatusCode = statusCode };

    public static ApiResponse<T> Created(T data, string? message = null) =>
        new() { Success = true, Data = data, Message = message, StatusCode = 201 };
}

public class ApiResponse : ApiResponse<object>
{
    public static ApiResponse OkNoData(string? message = null) =>
        new() { Success = true, Message = message, StatusCode = 200 };
}
