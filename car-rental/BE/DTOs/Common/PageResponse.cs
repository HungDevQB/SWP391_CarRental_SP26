namespace CarRental.API.DTOs.Common;

public class PageResponse<T>
{
    public List<T> Content { get; set; } = new();
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public long TotalElements { get; set; }
    public int TotalPages { get; set; }
    public bool Last { get; set; }
    public bool First { get; set; }

    public static PageResponse<T> Create(List<T> content, int page, int size, long total)
    {
        int totalPages = (int)Math.Ceiling((double)total / size);
        return new PageResponse<T>
        {
            Content = content,
            PageNumber = page,
            PageSize = size,
            TotalElements = total,
            TotalPages = totalPages,
            First = page == 0,
            Last = page >= totalPages - 1
        };
    }
}
