using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SwiftKwacha.Api.Models
{
    public class Wallet
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Balance { get; set; }

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        public virtual User User { get; set; }
    }
}
