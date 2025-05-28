using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwiftKwacha.Api.DTOs;
using SwiftKwacha.Api.Services;
using System.Security.Claims;

namespace SwiftKwacha.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WalletController : ControllerBase
    {
        private readonly IWalletService _walletService;
        private readonly IUserService _userService;

        public WalletController(IWalletService walletService, IUserService userService)
        {
            _walletService = walletService;
            _userService = userService;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? 
                throw new InvalidOperationException("User ID not found in token"));
        }

        [HttpGet("balance")]
        public async Task<ActionResult<decimal>> GetBalance()
        {
            var userId = GetUserId();
            var balance = await _walletService.GetBalanceAsync(userId);
            return Ok(balance);
        }

        [HttpPost("transaction")]
        public async Task<ActionResult<TransactionResponseDto>> CreateTransaction([FromBody] CreateTransactionDto transactionDto)
        {
            try
            {
                var userId = GetUserId();
                
                // If it's a transfer, get recipient's ID from username
                if (transactionDto.Type == Models.TransactionType.Transfer && !string.IsNullOrEmpty(transactionDto.RecipientUsername))
                {
                    var recipient = await _userService.GetByUsernameAsync(transactionDto.RecipientUsername);
                    if (recipient == null)
                    {
                        return NotFound($"Recipient with username '{transactionDto.RecipientUsername}' not found");
                    }
                    transactionDto.RecipientId = recipient.Id;
                }

                var result = await _walletService.CreateTransactionAsync(userId, transactionDto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("transactions")]
        public async Task<ActionResult<IEnumerable<TransactionResponseDto>>> GetTransactionHistory()
        {
            var userId = GetUserId();
            var transactions = await _walletService.GetTransactionHistoryAsync(userId);
            return Ok(transactions);
        }
    }
}
