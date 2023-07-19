namespace SongsServer.Models
{
    public class UserClass
    {
        public int id { get; set; }
        public string name { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public DateTime regDate { get; set; }
        public int score { get; set; }

        //return list of all users
        static public List<UserClass> getAllUsers()
        {
            DBservices dbs = new DBservices();
            return dbs.getAllUsers();
        }

        //return list of all user's favorite songs
        public static List<Song> getSongsByUser(int userId)
        {
            DBservices dbs = new DBservices();
            return dbs.getSongsByUser(userId);
        }

        //return list of all user's favorite artists
        public static List<Artist> getArtistsByUser(int userId)
        {
            DBservices dbs = new DBservices();
            return dbs.getArtistsByUser(userId);
        }

        //return User object after registration or null if it failed
        public UserClass Register()
        {

            DBservices dbs = new DBservices();
            return dbs.Register(this);
        }

        //return User object after logging or null if it failed
        public UserClass Login()
        {
            DBservices dbs = new DBservices();
            int res = dbs.FindUser(this.email);
            if (res == 0)
                throw new Exception("Email Not Exists.");
            else
            {
                UserClass u = dbs.checkUserPassword(this.email, this.password);
                if (u == null)
                {
                    throw new Exception("Invalid password attempt.");
                }
                else
                    return u;
            }
        }

        //return True if score updated and False if no
        public static UserClass updateUserScore(int id,int score)
        {
            DBservices dbs = new DBservices();
            return dbs.updateUserScore(id, score);
        }


        //return True if song addedd to user favorite songs and False if no
        public static bool addSongToFav(int userId, int songId)
        {
            DBservices dbs = new DBservices();
            return dbs.addSongToFav(userId, songId);
        }

        //return True if song removed from user favorite songs and False if no
        public static bool deleteSongFromFav(int userId, int songId)
        {
            DBservices dbs = new DBservices();
            return dbs.deleteSongFromFav(userId, songId);
        }

        //return Artist object that added to user favorite artists or null if it failed
        public static Artist addArtistToFav(int userId, int artistId)
        {
            DBservices dbs = new DBservices();
            return dbs.addArtistToFav(userId, artistId);
        }

        //return Artist object that removed from user favorite artists or null if it failed
        public static Artist deleteArtistFromFav(int userId, int artistId)
        {
            DBservices dbs = new DBservices();
            return dbs.deleteArtistFromFav(userId, artistId);
        }

        //return User object after updated details
        public UserClass updateUserDetails()
        {
            DBservices dbs = new DBservices();
            return dbs.updateUserDetails(this);
        }

        //return list of top 5 users by the total quiz score
        public static List<UserClass> getTop5()
        {
            DBservices dbs = new DBservices();
            return dbs.getTop5();
        }

        //return true if user deleted from DB and false if it failed
        public static bool deleteUser(int userId)
        {
            DBservices dbs = new DBservices();
            return dbs.deleteUser(userId);
        }
    }
}
