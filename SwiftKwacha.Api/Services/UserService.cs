using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SwiftKwacha.Api.Data;
using SwiftKwacha.Api.Models;

namespace SwiftKwacha.Api.Services
{
    public interface IUserService
    {
        Task<User> RegisterAsync(string username, string email, string password);
        Task<User> GetByUsernameAsync(string username);
        Task<User> GetByIdAsync(int id);
        Task<bool> ValidateCredentialsAsync(string username, string password);
    }

    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User> RegisterAsync(string username, string email, string password)
        {
            if (await _context.Users.AnyAsync(u => u.Username == username))
                throw new InvalidOperationException("Username already exists");

            if (await _context.Users.AnyAsync(u => u.Email == email))
                throw new InvalidOperationException("Email already exists");

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

            var user = new User
            {
                Username = username,
                Email = email,
                PasswordHash = passwordHash,
                CreatedAt = DateTime.UtcNow
            };

            var wallet = new Wallet
            {
                Balance = 0,
                LastUpdated = DateTime.UtcNow
            };

            user.Wallet = wallet;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<User> GetByUsernameAsync(string username)
        {
            return await _context.Users
                .Include(u => u.Wallet)
                .FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<User> GetByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.Wallet)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<bool> ValidateCredentialsAsync(string username, string password)
        {
            var user = await GetByUsernameAsync(username);
            if (user == null) return false;

            return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        }
    }
}
