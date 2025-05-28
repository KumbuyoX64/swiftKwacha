using Microsoft.EntityFrameworkCore;
using SwiftKwacha.Api.Data;
using SwiftKwacha.Api.DTOs;
using SwiftKwacha.Api.Models;

namespace SwiftKwacha.Api.Services
{
    public interface IWalletService
    {
        Task<TransactionResponseDto> CreateTransactionAsync(int userId, CreateTransactionDto transactionDto);
        Task<decimal> GetBalanceAsync(int userId);
        Task<IEnumerable<TransactionResponseDto>> GetTransactionHistoryAsync(int userId);
    }

    public class WalletService : IWalletService
    {
        private readonly ApplicationDbContext _context;

        public WalletService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TransactionResponseDto> CreateTransactionAsync(int userId, CreateTransactionDto transactionDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var wallet = await _context.Wallets
                    .Include(w => w.User)
                    .FirstOrDefaultAsync(w => w.UserId == userId);

                if (wallet == null)
                    throw new InvalidOperationException("Wallet not found");

                if (transactionDto.Type == TransactionType.Transfer && !transactionDto.RecipientId.HasValue)
                    throw new InvalidOperationException("Recipient is required for transfers");

                if (transactionDto.Type != TransactionType.Deposit && wallet.Balance < transactionDto.Amount)
                    throw new InvalidOperationException("Insufficient funds");

                // Update sender's wallet
                switch (transactionDto.Type)
                {
                    case TransactionType.Deposit:
                        wallet.Balance += transactionDto.Amount;
                        break;
                    case TransactionType.Withdrawal:
                        wallet.Balance -= transactionDto.Amount;
                        break;
                    case TransactionType.Transfer:
                        wallet.Balance -= transactionDto.Amount;
                        var recipientWallet = await _context.Wallets
                            .Include(w => w.User)
                            .FirstOrDefaultAsync(w => w.UserId == transactionDto.RecipientId);
                        
                        if (recipientWallet == null)
                            throw new InvalidOperationException("Recipient wallet not found");
                            
                        recipientWallet.Balance += transactionDto.Amount;
                        break;
                }

                var newTransaction = new Transaction
                {
                    UserId = userId,
                    Amount = transactionDto.Amount,
                    Type = transactionDto.Type,
                    Description = transactionDto.Description
                };

                _context.Transactions.Add(newTransaction);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new TransactionResponseDto
                {
                    Id = newTransaction.Id,
                    Amount = newTransaction.Amount,
                    Type = newTransaction.Type.ToString(),
                    Description = newTransaction.Description,
                    CreatedAt = newTransaction.CreatedAt,
                    Username = wallet.User.Username,
                    NewBalance = wallet.Balance
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<decimal> GetBalanceAsync(int userId)
        {
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null)
                throw new InvalidOperationException("Wallet not found");

            return wallet.Balance;
        }

        public async Task<IEnumerable<TransactionResponseDto>> GetTransactionHistoryAsync(int userId)
        {
            return await _context.Transactions
                .Include(t => t.User)
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TransactionResponseDto
                {
                    Id = t.Id,
                    Amount = t.Amount,
                    Type = t.Type.ToString(),
                    Description = t.Description,
                    CreatedAt = t.CreatedAt,
                    Username = t.User.Username,
                    NewBalance = t.User.Wallet.Balance
                })
                .ToListAsync();
        }
    }
}
