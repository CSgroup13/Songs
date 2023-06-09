namespace SongsServer.Models
{
    public class Artist
    {
        public int id { get; set; }
        public string name { get; set; }
        public int rate { get; set; }

        public static List<Artist> getAllArtists()
        {
            DBservices dbs = new DBservices();
            return dbs.getAllArtists();
        }

        public static List<Song> getSongsByArtist(string artistName)
        {
            DBservices dbs = new DBservices();
            return dbs.getSongsByArtist(artistName);
        }
    }
}
