using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
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
        public string deezerApi = "http://api.deezer.com/search/";

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
        public async Task<IActionResult> getArtistById(int id)
        {
            try
            {
                Artist a = Artist.getArtistById(id);
                string apiUrl = deezerApi + "artist/?q=" + a.name + "&index=0&limit=1&output=json";
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(apiUrl);
                request.Method = "GET";

                // Get the response from the Deezer API
                using (HttpWebResponse response = (HttpWebResponse)await request.GetResponseAsync())
                using (Stream stream = response.GetResponseStream())
                using (StreamReader reader = new StreamReader(stream))
                {
                    string jsonResponse = await reader.ReadToEndAsync();
                    var res=JsonConvert.DeserializeObject<dynamic>(jsonResponse);
                    a.numOfAlbums = res.data[0].nb_album;
                    a.image = res.data[0].picture_medium;
                    return Ok(a);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        //// GET: api/Artists/{artistName}/image
        //[HttpGet("{artistName}/image")]
        //public async Task<IActionResult> GetArtistImage(string artistName)
        //{
        //    try
        //    {
        //        string apiUrl = deezerApi+"artist/?q=" +artistName+"&index=0&limit=1&output=json";
        //        HttpWebRequest request = (HttpWebRequest)WebRequest.Create(apiUrl);
        //        request.Method = "GET";

        //        // Get the response from the Deezer API
        //        using (HttpWebResponse response = (HttpWebResponse)await request.GetResponseAsync())
        //        using (Stream stream = response.GetResponseStream())
        //        using (StreamReader reader = new StreamReader(stream))
        //        {
        //            string jsonResponse = await reader.ReadToEndAsync();


        //            // Return the Deezer API response as the result
        //            return Content(jsonResponse, "application/json");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(ex.Message);
        //    }
        //}

      
    }
}
