using Microsoft.AspNetCore.Mvc;
using SongsServer.Models;
using System.Diagnostics.Eventing.Reader;


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
        [HttpGet("{userId}/songs")]
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

        [HttpPost("{userId}/Score/{userScore}")]
        public IActionResult updateUserScore(int userId, int userScore)
        {
            if (UserClass.updateUserScore(userId, userScore))
                return Ok(true);
            return BadRequest("Couldn't update score");


        }

        // POST api/<UsersController>
        [HttpPost("{userId}/{songId}")]
        public IActionResult addSongToFav(int userId, int songId)
        {
            if (UserClass.addSongToFav(userId, songId))
                return Ok(true);
            return BadRequest("Song is already in favorites");
        }

        // DELETE api/<UsersController>/5
        [HttpDelete("{userId}/{songId}")]
        public IActionResult deleteSongFromFav(int userId, int songId)
        {
            if (UserClass.deleteSongFromFav(userId, songId))
                return Ok(true);
            return BadRequest("Song is not in favorites");
        }

        // POST api/<UsersController>
        [HttpPost("{userId}/addArtistToFav/{artistId}")]
        public IActionResult addArtistToFav(int userId, int artistId)
        {
            if (UserClass.addArtistToFav(userId, artistId))
                return Ok(true);
            return BadRequest("Artist is already in favorites");
        }

        // DELETE api/<UsersController>
        [HttpDelete("{userId}/removeArtistFromFav/{artistId}")]
        public IActionResult deleteArtistFromFav(int userId, int artistId)
        {
            if (UserClass.deleteArtistFromFav(userId, artistId))
                return Ok(true);
            return BadRequest("Artist is not in favorites");
        }

    }
}
