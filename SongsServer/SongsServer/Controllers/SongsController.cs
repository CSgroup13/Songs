using Microsoft.AspNetCore.Mvc;
using SongsServer.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace SongsServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SongsController : ControllerBase
    {

        // GET: api/<SongsController>
        [HttpGet]
        public IActionResult getAllSongs()
        {
            try
            {
                return Ok(Song.getAllSongs());
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }
        // GET: api/<SongsController>/randomSong
        [HttpGet("randomSong")]
        public IActionResult getRandomSong()
        {
            try
            {
                return Ok(Song.getRandomSong());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/<SongsController>/randomSong
        [HttpGet("diffRandomSongs/{songName}")]
        public IActionResult getDiffRandomSongs(String songName)
        {
            try
            {
                return Ok(Song.getDiffRandomSongs(songName));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/<SongsController>/{songName}/info
        [HttpGet("{songName}/info")]
        public IActionResult getSongByName(string songName)
        {
            try
            {
                return Ok(Song.getSongByName(songName));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        // GET: api/<SongsController>/songBylyrics
        [HttpGet("songBylyrics")]
        public IActionResult getByLyrics(string lyrics)
        {
            try
            {
                return Ok(Song.getByLyrics(lyrics));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET api/<SongsController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<SongsController>
        [HttpPost]
        public IActionResult Post([FromBody] Song s)
        {
            try
            {
                return Ok(s.InsertSong());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT api/<SongsController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<SongsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
