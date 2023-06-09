using Microsoft.AspNetCore.Mvc;
using SongsServer.Models;


// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace SongsServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        // GET: api/<UsersController>/
        [HttpGet]
        public List<UserClass> getAllUsers()
        {
            return UserClass.getAllUsers();
        }

        // GET: api/<UsersController>/
        [HttpGet("{userName}/songs")]
        public List<Song> getSongsByUser(int userId)
        {
            return UserClass.getSongsByUser(userId);
        }

        // POST api/<UsersController>/register
        [HttpPost("register")]
        public IActionResult Register([FromBody] UserClass u)
        {
            try
            {
                return Ok(u.Register());
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        // POST api/<UsersController>/login
        [HttpPost("login")]
        public IActionResult Login([FromBody] UserClass u)
        {
            try
            {
                return Ok(u.Login());
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        // POST api/<UsersController>/login/1/1
        [HttpPost("{userId}/{songId}")]
        public bool addSongToFav(int userId, int songId)
        {
            return UserClass.addSongToFav(userId, songId);
        }

        // DELETE api/<UsersController>/5
        [HttpDelete("{userId}/{songId}")]
        public bool deleteSongFromFav(int userId, int songId)
        {
            return UserClass.deleteSongFromFav(userId, songId);
        }
    }
}
