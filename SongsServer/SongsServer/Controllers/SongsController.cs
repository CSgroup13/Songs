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
        public List<Song> getAllSongs()
        {
            return Song.getAllSongs();
        }
        // GET: api/<SongsController>/randomSong
        [HttpGet("randomSong")]
        public Song getRandomSong()
        {
            return Song.getRandomSong();
        }
        // GET: api/<SongsController>/{songName}/info
        [HttpGet("{songName}/info")]
        public Song getSongByName(string songName)
        {
            return Song.getSongByName(songName);
        }
        // GET: api/<SongsController>/songBylyrics
        [HttpGet("songBylyrics")]
        public Song getByLyrics(string lyrics)
        {
            return Song.getByLyrics(lyrics);
        }

        // GET api/<SongsController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<SongsController>
        [HttpPost]
        public bool Post([FromBody] Song s)
        {
            return s.InsertSong();
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
