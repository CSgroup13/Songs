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
        //get all users
        // GET: api/<UsersController>/
        [HttpGet]
        public List<UserClass> getAllUsers()
        {
            return UserClass.getAllUsers();
        }

        //get all favorite songs of user by user id
        // GET: api/<UsersController>/
        [HttpGet("{userId}/songs")]
        public List<Song> getSongsByUser(int userId)
        {
            return UserClass.getSongsByUser(userId);
        }

        //get all favorite artists of user by user id
        // GET: api/<UsersController>/userId/artists
        [HttpGet("{userId}/artists")]
        public List<Artist> getArtistsByUser(int userId)
        {
            return UserClass.getArtistsByUser(userId);
        }

        //get top 5 of users by users total score in the quiz
        // GET: api/<UsersController>/leaders
        [HttpGet("leaders")]
        public List<UserClass> getTop5()
        {
            return UserClass.getTop5();
        }

        //post User object to DB while registration
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

        //post User object (email and password) to DB while logging
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

        //update user score in DB
        [HttpPost("{userId}/Score/{userScore}")]
        public IActionResult updateUserScore(int userId, int userScore)
        {
            try
            {
                return Ok(UserClass.updateUserScore(userId, userScore));
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        //post for adding song to favorites of user
        // POST api/<UsersController>
        [HttpPost("{userId}/{songId}")]
        public IActionResult addSongToFav(int userId, int songId)
        {
            if (UserClass.addSongToFav(userId, songId))
                return Ok(true);
            return BadRequest("Song is already in favorites");
        }

        //post for adding artist to favorites of user
        // POST api/<UsersController>
        [HttpPost("{userId}/addArtistToFav/{artistId}")]
        public IActionResult addArtistToFav(int userId, int artistId)
        {
            try
            {
                return Ok(UserClass.addArtistToFav(userId, artistId));
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        //update user details (by admin)
        // POST api/<UsersController>/register
        [HttpPut("update")]
        public IActionResult updateUserDetails([FromBody] UserClass u)
        {
            try
            {
                return Ok(u.updateUserDetails());
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        //delete song from user's favorite songs
        // DELETE api/<UsersController>/5
        [HttpDelete("{userId}/{songId}")]
        public IActionResult deleteSongFromFav(int userId, int songId)
        {
            if (UserClass.deleteSongFromFav(userId, songId))
                return Ok(true);
            return BadRequest("Song is not in favorites");
        }

        //delete artist from user's favorite artists
        // DELETE api/<UsersController>
        [HttpDelete("{userId}/removeArtistFromFav/{artistId}")]
        public IActionResult deleteArtistFromFav(int userId, int artistId)
        {
            try
            {
                return Ok(UserClass.deleteArtistFromFav(userId, artistId));
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        //delete user(by admin)
        // DELETE api/<UsersController>/5
        [HttpDelete("remove/{userId}")]
        public IActionResult deleteUser(int userId)
        {
            if (UserClass.deleteUser(userId))
                return Ok(true);
            return BadRequest("User does not exist");
        }
    }
}
