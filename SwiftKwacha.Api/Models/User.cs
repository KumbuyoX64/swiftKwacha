using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SwiftKwacha.Api.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public virtual Wallet Wallet { get; set; }
        public virtual ICollection<Transaction> Transactions { get; set; }
    }
}
