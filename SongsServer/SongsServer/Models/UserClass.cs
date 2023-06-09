namespace SongsServer.Models
{
    public class UserClass
    {
        public int id { get; set; }
        public string name { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public DateTime regDate { get; set; }

        static public List<UserClass> getAllUsers()
        {
            DBservices dbs = new DBservices();
            return dbs.getAllUsers();
        }
        public static List<Song> getSongsByUser(int userId)
        {
            DBservices dbs = new DBservices();
            return dbs.getSongsByUser(userId);
        }
        public UserClass Register()
        {

            DBservices dbs = new DBservices();
            return dbs.Register(this);
        }
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

        public static bool addSongToFav(int userId, int songId)
        {
            DBservices dbs = new DBservices();
            return dbs.addSongToFav(userId, songId);
        }
        public static bool deleteSongFromFav(int userId, int songId)
        {
            DBservices dbs = new DBservices();
            return dbs.deleteSongFromFav(userId, songId);
        }

    }
}
