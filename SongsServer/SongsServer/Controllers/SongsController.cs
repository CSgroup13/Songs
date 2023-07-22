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
        public string deezerApi = "https://api.deezer.com/search";
        private HttpWebRequest request;

        //get all songs
        // GET: api/<SongsController>
        [HttpGet]
        public IActionResult getAllSongs()
        {
            try
            {
                return Ok(Song.getAllSongs());
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
            //List<Song> songsList = Song.getAllSongs();
            //foreach (var song in songsList)
            //{
            //    request = (HttpWebRequest)WebRequest.Create(deezerApi + "/track?q=" + song.name);
            //    request.Method = "GET";
            //    using (HttpWebResponse response = (HttpWebResponse)await request.GetResponseAsync())
            //    using (Stream stream = response.GetResponseStream())
            //    using (StreamReader reader = new StreamReader(stream))
            //    {
            //        string jsonResponse = await reader.ReadToEndAsync();
            //        var res = JsonConvert.DeserializeObject<dynamic>(jsonResponse);
            //        res = res.data;
            //        foreach (var item in res)
            //        {
            //            if(item.artist.name==song.artistName)
            //            {
            //                song.image=item.image;
            //                song.songPreview=item.preview;
            //                break;
            //            }
            //        }
            //    }
            //}
            //return Ok(songsList);
        }

        //get 3 random songs
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

        //get 3 random songs that are different from songName
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

        //get 3 random songs that are not songs of artist(by artistName)
        // GET: api/<SongsController>/randomSong
        [HttpGet("getSongByDiffArtist/{artistName}")]
        public IActionResult getSongByDiffArtist(String artistName)
        {
            try
            {
                return Ok(Song.getSongByDiffArtist(artistName));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        //get song info by name
        // GET: api/<SongsController>/{songName}/info
        [HttpGet("{songName}/info")]
        public async Task<IActionResult> getSongByName(string songName)
        {
            try
            {
                Song s = Song.getSongByName(songName);
                string apiUrl = deezerApi + "?q=" + s.name + "&index=0&output=json";
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(apiUrl);
                request.Method = "GET";

                // Get the response from the Deezer API
                using (HttpWebResponse response = (HttpWebResponse)await request.GetResponseAsync())
                using (Stream stream = response.GetResponseStream())
                using (StreamReader reader = new StreamReader(stream))
                {
                    string jsonResponse = await reader.ReadToEndAsync();
                    var res = JsonConvert.DeserializeObject<dynamic>(jsonResponse);
                    var resArr = res.data;
                    foreach (var item in resArr)
                    {
                        if (item.artist.name.ToString().Contains(s.artistName, StringComparison.OrdinalIgnoreCase))
                        {
                            s.songPreview = item.preview;
                            return Ok(s);

                        }
                    }
                    if (resArr.Count == 0) return Ok(s);
                    s.songPreview = res.data[0].preview;
                    return Ok(s);
                }

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        //get song info by lyrics
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

        //get all comments of song
        // GET api/<SongsController>
        [HttpGet("comments/{songId}")]
        public IActionResult getComments(int songId)
        {
            try
            {
                return Ok(Song.getComments(songId));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        //add song to DB
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

        //add comment to song
        // POST api/<SongsController>
        [HttpPost("addComment/{songId}/{userId}")]
        public IActionResult addComment(int songId,int userId, [FromBody] string comment)
        {
            try
            {
                return Ok(Song.addComment(songId, userId, comment));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        //delete comment of song by songId and commentId
        // DELETE api/<SongsController>
        [HttpDelete("deleteComment/{songId}/{commentId}")]
        public IActionResult deleteComment(int songId, int commentId)
        {
            try
            {
                return Ok(Song.deleteComment(songId, commentId));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
