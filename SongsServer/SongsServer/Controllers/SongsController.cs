using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SongsServer.Models;
using System.Net;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace SongsServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SongsController : ControllerBase
    {
        public string deezerApi = "http://api.deezer.com/search";

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
        public async Task<IActionResult> getSongByName(string songName)
        {
            try
            {
                Song s = Song.getSongByName(songName);
                string apiUrl = deezerApi + "?q=" + s.name + "&index=0&limit=1&output=json";
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(apiUrl);
                request.Method = "GET";

                // Get the response from the Deezer API
                using (HttpWebResponse response = (HttpWebResponse)await request.GetResponseAsync())
                using (Stream stream = response.GetResponseStream())
                using (StreamReader reader = new StreamReader(stream))
                {
                    string jsonResponse = await reader.ReadToEndAsync();
                    var res = JsonConvert.DeserializeObject<dynamic>(jsonResponse);
                    s.songPreview = res.data[0].preview;
                    return Ok(s);
                }
              
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
