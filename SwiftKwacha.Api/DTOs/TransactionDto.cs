using System.ComponentModel.DataAnnotations;
using SwiftKwacha.Api.Models;

namespace SwiftKwacha.Api.DTOs
{
    public class CreateTransactionDto
    {
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [Required]
        public TransactionType Type { get; set; }

        [Required]
        [StringLength(255)]
        public string Description { get; set; } = string.Empty;

        public string? RecipientUsername { get; set; }
        
        public int? RecipientId { get; set; }  // Only required for transfers
    }

    public class TransactionResponseDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string Username { get; set; } = string.Empty;
        public decimal NewBalance { get; set; }
    }
}
