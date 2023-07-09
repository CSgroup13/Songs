namespace SongsServer.Models
{
    public class Song
    {
        public int id { get; set; }
        public string name { get; set; }
        public string artistName { get; set; }
        public string link { get; set; }
        public string lyrics { get; set; }
        public int rate { get; set; }

        public bool InsertSong()
        {
            DBservices dbs = new DBservices();
            return dbs.InsertSong(this) == 1;
        }
        public static List<Song> getAllSongs()
        {
            DBservices dbs = new DBservices();
            return dbs.getAllSongs();
        }
        public static List<Song> getRandomSong()
        {
            DBservices dbs = new DBservices();
            return dbs.getRandomSong();
        }
        public static Song getSongByName(string songName)
        {
            DBservices dbs = new DBservices();
            return dbs.getSongByName(songName);
        }

        public static List<Song> getByLyrics(string lyrics)
        {
            DBservices dbs = new DBservices();
            return dbs.getByLyrics(lyrics);
        }
    }
}
