using System.Text.RegularExpressions;

var lines = File.ReadAllLines(@"c:\Chuyên Ngành 7\SWP392_CarRental\car-rental\Account.txt");
var sqlLines = new List<string>();

foreach (var line in lines)
{
    var match = Regex.Match(line.Trim(), @"Username:\s*(\S+),\s*Password:\s*(\S+)");
    if (match.Success)
    {
        var username = match.Groups[1].Value;
        var password = match.Groups[2].Value;
        var hash = BCrypt.Net.BCrypt.HashPassword(password);
        sqlLines.Add($"UPDATE [User] SET password_hash = '{hash}' WHERE username = '{username}';");
        Console.WriteLine($"  {username} OK");
    }
}

var sqlPath = @"c:\Chuyên Ngành 7\SWP392_CarRental\car-rental\fix_passwords.sql";
File.WriteAllText(sqlPath, string.Join("\n", sqlLines));
Console.WriteLine($"\n{sqlLines.Count} accounts hashed => {sqlPath}");
