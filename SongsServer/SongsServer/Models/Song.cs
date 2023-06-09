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
    }
}
