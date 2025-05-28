using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SwiftKwacha.Api.Data;
using SwiftKwacha.Api.DTOs;
using SwiftKwacha.Api.Models;

namespace SwiftKwacha.Api.Services
{
    public interface IAuthService
    {
        Task<(UserResponseDto User, string Token)> RegisterAsync(RegisterUserDto registerDto);
        Task<(UserResponseDto User, string Token)> LoginAsync(LoginUserDto loginDto);
    }

    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<(UserResponseDto User, string Token)> RegisterAsync(RegisterUserDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
                throw new InvalidOperationException("Username already exists");

            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                throw new InvalidOperationException("Email already exists");

            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password)
            };

            var wallet = new Wallet
            {
                Balance = 0,
                User = user
            };

            _context.Users.Add(user);
            _context.Wallets.Add(wallet);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);
            return (new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                WalletBalance = wallet.Balance
            }, token);
        }

        public async Task<(UserResponseDto User, string Token)> LoginAsync(LoginUserDto loginDto)
        {
            var user = await _context.Users
                .Include(u => u.Wallet)
                .FirstOrDefaultAsync(u => u.Username == loginDto.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                throw new InvalidOperationException("Invalid username or password");

            var token = GenerateJwtToken(user);
            return (new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                WalletBalance = user.Wallet.Balance
            }, token);
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? 
                throw new InvalidOperationException("JWT Key not configured");
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? 
                throw new InvalidOperationException("JWT Issuer not configured");
            var jwtAudience = _configuration["Jwt:Audience"] ?? 
                throw new InvalidOperationException("JWT Audience not configured");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
