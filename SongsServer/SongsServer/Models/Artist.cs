namespace SongsServer.Models
{
    public class Artist
    {
        public int id { get; set; }
        public string name { get; set; }
        public int rate { get; set; }
        public string image { get; set; }


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

        public static Artist getArtistById(int id)
        {
            DBservices dbs = new DBservices();
            return dbs.getArtistById(id);
        }

        public static Artist getArtistByName(string artistName)
        {
            DBservices dbs = new DBservices();
            return dbs.getArtistByName(artistName);
        }
    }
}
