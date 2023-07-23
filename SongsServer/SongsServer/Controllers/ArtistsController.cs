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

        //get all artists
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

        //get songs of specific artist by artist name
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

        //get info about artist by artist id
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

        //get info about artist by artist name
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

        //get random artist
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

        //get random artists that are different from some artist(by name) 
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