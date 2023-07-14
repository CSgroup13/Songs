using Microsoft.AspNetCore.Mvc;
using SongsServer.Models;
using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace SongsServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArtistsController : ControllerBase
    {
        // GET: api/<ArtistsController>
        [HttpGet]
        public IActionResult getAllArtists()
        {

            try
            {
                return Ok(Artist.getAllArtists());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{artistName}/songs")]
        public IActionResult getSongsByArtist(string artistName)
        {
            try
            {
            return Ok(Artist.getSongsByArtist(artistName));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET api/<ArtistsController>
        [HttpGet("{id}/info")]
        public IActionResult getArtistById(int id)
        {
            try
            {
                return Ok(Artist.getArtistById(id));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/Artists/{artistName}/image
        [HttpGet("{artistName}/image")]
        public async Task<IActionResult> GetArtistImage(string artistName)
        {
            try
            {
                string apiUrl = "http://api.deezer.com/search/artist/?q=" +artistName+"&index=0&limit=1&output=json";
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(apiUrl);
                request.Method = "GET";

                // Get the response from the Deezer API
                using (HttpWebResponse response = (HttpWebResponse)await request.GetResponseAsync())
                using (Stream stream = response.GetResponseStream())
                using (StreamReader reader = new StreamReader(stream))
                {
                    string jsonResponse = await reader.ReadToEndAsync();

                    // Return the Deezer API response as the result
                    return Content(jsonResponse, "application/json");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // POST api/<ArtistsController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<ArtistsController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<ArtistsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
