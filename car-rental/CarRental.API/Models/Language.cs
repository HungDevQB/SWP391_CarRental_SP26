using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarRental.API.Models;

[Table("Language")]
public class Language
{
    [Key]
    [Column("language_id")]
    public int LanguageId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("language_name")]
    public string LanguageName { get; set; } = string.Empty;

    [MaxLength(10)]
    [Column("language_code")]
    public string? LanguageCode { get; set; }

}
