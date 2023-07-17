using System.Dynamic;

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
        public string image { get; set; }
        public string songPreview { get; set; }

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
        public static List<Song> getDiffRandomSongs(String songName)
        {
            DBservices dbs = new DBservices();
            return dbs.getDiffRandomSongs(songName);
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

        public static Song getSongByDiffArtist(string artistName)
        {
            DBservices dbs = new DBservices();
            return dbs.getSongByDiffArtist(artistName);
        }
        public static List<ExpandoObject> addComment(int songId, int userId,string comment)
        {
            DBservices dbs = new DBservices();
            return dbs.addCommentToSong(songId, userId, comment);
        }
        public static List<ExpandoObject> deleteComment(int songId,int commentId)
        {
            DBservices dbs = new DBservices();
            return dbs.deleteCommentOfSong(songId, commentId);
        }

        public static List<ExpandoObject> getComments(int songId)
        {
            DBservices dbs = new DBservices();
            return dbs.getCommentsOfSong(songId);
        }
    }
}
