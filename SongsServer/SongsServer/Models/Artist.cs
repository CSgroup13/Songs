namespace SongsServer.Models
{
    public class Artist
    {
        public int id { get; set; }
        public string name { get; set; }
        public int rate { get; set; }
        public string image { get; set; }


        //return list of all artists
        public static List<Artist> getAllArtists()
        {
            DBservices dbs = new DBservices();
            return dbs.getAllArtists();
        }

        //return list of artist's songs by artist name
        public static List<Song> getSongsByArtist(string artistName)
        {
            DBservices dbs = new DBservices();
            return dbs.getSongsByArtist(artistName);
        }

        //return Artist object by artist id
        public static Artist getArtistById(int id)
        {
            DBservices dbs = new DBservices();
            return dbs.getArtistById(id);
        }

        //return random Artist object
        public static Artist getRandomArtist()
        {
            DBservices dbs = new DBservices();
            return dbs.getRandomArtist();
        }

        //return list of all artists that their name start with artistName
        public static List<Artist> getArtistByName(string artistName)
        {
            DBservices dbs = new DBservices();
            return dbs.getArtistByName(artistName);
        }

        //return list of artists that are different from some artist
        public static List<Artist> getDiffRandomArtists(String artistName)
        {
            DBservices dbs = new DBservices();
            return dbs.getDiffRandomArtists(artistName);
        }
    }
}
