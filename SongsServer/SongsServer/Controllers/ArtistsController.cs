using Microsoft.AspNetCore.DataProtection.KeyManagement;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SqlServer.Server;
using Newtonsoft.Json;
using SongsServer.Models;
using System;
using System.Collections;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

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
                return (Ok(Artist.getAllArtists()));
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

        // GET api/<ArtistsController>
        [HttpGet("byName/{artistName}/info")]
        public IActionResult getArtistByName(string artistName)
        {
            try
            {
                return Ok(Artist.getArtistByName(artistName));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET api/<ArtistsController>
        [HttpGet("randomArtist")]
        public IActionResult getRandomArtist()
        {
            try
            {
                return Ok(Artist.getRandomArtist());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/<SongsController>/randomSong
        [HttpGet("diffRandomArtists/{artistName}")]
        public IActionResult getDiffRandomArtists(String artistName)
        {
            try
            {
                return Ok(Artist.getDiffRandomArtists(artistName));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

//public string deezerApi = "http://api.deezer.com/search/";
//public string lastfmBaseAPi = "http://ws.audioscrobbler.com/2.0";
//public string lastfmKey = "d6293ebc904c9f3e71bf638f0b55a5f6";
//private HttpWebRequest request;

//Artist a = Artist.getArtistById(id);
//string lastFmApi = lastfmBaseAPi + "/?method=artist.getinfo&artist="+a.name+"&api_key="+lastfmKey+"&format=json";
//request = (HttpWebRequest)WebRequest.Create(lastFmApi);
//request.Method = "GET";

//// Get the response from the Last.fm API
//using (HttpWebResponse response = (HttpWebResponse)await request.GetResponseAsync())
//using (Stream stream = response.GetResponseStream())
//using (StreamReader reader = new StreamReader(stream))
//{
//    string jsonResponse = await reader.ReadToEndAsync();
//    var res = JsonConvert.DeserializeObject<dynamic>(jsonResponse);
//    a.summary = res.artist.bio.summary;
//    a.listeners = res.artist.stats.listeners;
//    a.playcount = res.artist.stats.playcount;
//}