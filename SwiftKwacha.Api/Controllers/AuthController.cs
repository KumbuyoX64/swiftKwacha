using Microsoft.AspNetCore.Mvc;
using SwiftKwacha.Api.DTOs;
using SwiftKwacha.Api.Services;

namespace SwiftKwacha.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserResponseDto>> Register(RegisterUserDto registerDto)
        {
            try
            {
                var (user, token) = await _authService.RegisterAsync(registerDto);
                Response.Headers.Append("Authorization", $"Bearer {token}");
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserResponseDto>> Login(LoginUserDto loginDto)
        {
            try
            {
                var (user, token) = await _authService.LoginAsync(loginDto);
                Response.Headers.Append("Authorization", $"Bearer {token}");
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
