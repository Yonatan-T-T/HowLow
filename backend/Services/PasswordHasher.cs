using System.Security.Cryptography;

namespace UniqueLow.Api.Services;

public static class PasswordHasher
{
    private const int SaltSize = 16; // 128-bit salt
    private const int KeySize = 32;  // 256-bit subkey
    private const int Iterations = 100000;

    public static void CreatePasswordHash(string password, out string hash, out string salt)
    {
        byte[] saltBytes = RandomNumberGenerator.GetBytes(SaltSize);
        byte[] hashBytes = Rfc2898DeriveBytes.Pbkdf2(
            password,
            saltBytes,
            Iterations,
            HashAlgorithmName.SHA256,
            KeySize);

        salt = Convert.ToBase64String(saltBytes);
        hash = Convert.ToBase64String(hashBytes);
    }

    public static bool VerifyPassword(string password, string storedHash, string storedSalt)
    {
        if (string.IsNullOrWhiteSpace(password) || 
            string.IsNullOrWhiteSpace(storedHash) || 
            string.IsNullOrWhiteSpace(storedSalt))
        {
            return false;
        }

        try
        {
            byte[] saltBytes = Convert.FromBase64String(storedSalt);
            byte[] expectedHashBytes = Convert.FromBase64String(storedHash);

            byte[] actualHashBytes = Rfc2898DeriveBytes.Pbkdf2(
                password,
                saltBytes,
                Iterations,
                HashAlgorithmName.SHA256,
                KeySize);

            return CryptographicOperations.FixedTimeEquals(actualHashBytes, expectedHashBytes);
        }
        catch
        {
            return false;
        }
    }
}
