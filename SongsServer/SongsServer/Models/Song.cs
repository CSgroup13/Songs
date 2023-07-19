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

        //insert new song to DB and return true if success, otherwise flase
        public bool InsertSong()
        {
            DBservices dbs = new DBservices();
            return dbs.InsertSong(this) == 1;
        }

        //return list of all songs in DB
        public static List<Song> getAllSongs()
        {
            DBservices dbs = new DBservices();
            return dbs.getAllSongs();
        }

        //return list of 3 random songs
        public static List<Song> getRandomSong()
        {
            DBservices dbs = new DBservices();
            return dbs.getRandomSong();
        }

        //return list of random songs that are different from songName
        public static List<Song> getDiffRandomSongs(String songName)
        {
            DBservices dbs = new DBservices();
            return dbs.getDiffRandomSongs(songName);
        }

        //return Song object by song name
        public static Song getSongByName(string songName)
        {
            DBservices dbs = new DBservices();
            return dbs.getSongByName(songName);
        }


        //return list of all songs that their lyrics contain the lyrics input
        public static List<Song> getByLyrics(string lyrics)
        {
            DBservices dbs = new DBservices();
            return dbs.getByLyrics(lyrics);
        }

        //return list of 3 random songs that are not songs of artist(by artistName)
        public static Song getSongByDiffArtist(string artistName)
        {
            DBservices dbs = new DBservices();
            return dbs.getSongByDiffArtist(artistName);
        }

        //add new comment to song and return a list(dynamic objects) of all updated song comments
        public static List<ExpandoObject> addComment(int songId, int userId,string comment)
        {
            DBservices dbs = new DBservices();
            return dbs.addCommentToSong(songId, userId, comment);
        }

        //delete comment from song and return a list(dynamic objects) of all updated song comments
        public static List<ExpandoObject> deleteComment(int songId,int commentId)
        {
            DBservices dbs = new DBservices();
            return dbs.deleteCommentOfSong(songId, commentId);
        }

        //return a list(dynamic objects) of all song comments
        public static List<ExpandoObject> getComments(int songId)
        {
            DBservices dbs = new DBservices();
            return dbs.getCommentsOfSong(songId);
        }
    }
}
