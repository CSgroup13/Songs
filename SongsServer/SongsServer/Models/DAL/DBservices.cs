﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.SqlClient;
using System.Data;
using System.Text;
using System.Net;
using System.Diagnostics.Metrics;
using SongsServer.Models;

/// <summary>
/// DBServices is a class created by me to provides some DataBase Services
/// </summary>
public class DBservices
{

    public DBservices()
    {
        //
        // TODO: Add constructor logic here
        //
    }

    //--------------------------------------------------------------------------------------------------
    // This method creates a connection to the database according to the connectionString name in the web.config 
    //--------------------------------------------------------------------------------------------------
    public SqlConnection connect(string conString)
    {

        // read the connection string from the configuration file
        IConfigurationRoot configuration = new ConfigurationBuilder()
        .AddJsonFile("appsettings.json").Build();
        string cStr = configuration.GetConnectionString("myProjDB");
        SqlConnection con = new SqlConnection(cStr);
        con.Open();
        return con;
    }

    //---------------------------------------------------------------------------------
    // Create the SqlCommand using a stored procedure
    //---------------------------------------------------------------------------------
    private SqlCommand CreateCommandWithStoredProcedure(string spName, SqlConnection con, Dictionary<string, object> paramDic)
    {

        SqlCommand cmd = new SqlCommand(); // create the command object

        cmd.Connection = con;              // assign the connection to the command object

        cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 

        cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

        cmd.CommandType = CommandType.StoredProcedure; // the type of the command, can also be text

        if (paramDic != null)
            foreach (KeyValuePair<string, object> param in paramDic)
            {
                cmd.Parameters.AddWithValue(param.Key, param.Value);

            }


        return cmd;
    }

    //*****************************************************Users Methods*********************************************************************************

    //--------------------------------------------------------------------------------------------------
    // This method reads all users
    //--------------------------------------------------------------------------------------------------
    public List<UserClass> getAllUsers()
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            throw (ex);
        }


        cmd = CreateCommandWithStoredProcedure("SP_getAllUsers", con, null);             // create the command


        List<UserClass> usersList = new List<UserClass>();

        try
        {
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            while (dataReader.Read())
            {
                UserClass u = new UserClass();
                u.id = Convert.ToInt32(dataReader["id"]);
                u.name = dataReader["name"].ToString();
                u.email = dataReader["email"].ToString();
                u.password = dataReader["password"].ToString();
                u.regDate = Convert.ToDateTime(dataReader["regDate"]);
                usersList.Add(u);
            }
            return usersList;
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }

    }

    //--------------------------------------------------------------------------------------------------
    // This method reads all songs of specific user
    //--------------------------------------------------------------------------------------------------
    public List<Song> getSongsByUser(int userId)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            throw (ex);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@userId", userId);
        cmd = CreateCommandWithStoredProcedure("SP_getSongsByUser", con, paramDic);             // create the command

        List<Song> songsList = new List<Song>();

        try
        {
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            while (dataReader.Read())
            {
                Song s = new Song();
                s.id = Convert.ToInt32(dataReader["id"]);
                s.name = dataReader["name"].ToString();
                s.artistName = dataReader["artistName"].ToString();
                s.link = dataReader["link"].ToString();
                s.lyrics = dataReader["lyrics"].ToString();
                s.rate = Convert.ToInt32(dataReader["rate"]);
                songsList.Add(s);
            }
            return songsList;
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }

    }

    //--------------------------------------------------------------------------------------------------
    // This method Inserts a new User to the Users table 
    //--------------------------------------------------------------------------------------------------
    public UserClass Register(UserClass user)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            throw (ex);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@name", user.name);
        paramDic.Add("@email", user.email);
        paramDic.Add("@password", user.password);
        paramDic.Add("@regDate", user.regDate);


        cmd = CreateCommandWithStoredProcedure("SP_Register", con, paramDic);             // create the command

        try
        {
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            if (dataReader.Read())
            {
                UserClass u = new UserClass();
                u.id = Convert.ToInt32(dataReader["id"]);
                u.name = dataReader["name"].ToString();
                u.email = dataReader["email"].ToString();
                u.password = dataReader["password"].ToString();
                u.regDate = Convert.ToDateTime(dataReader["regDate"]);
                return u;
            }
            throw new Exception("User with this email is already exits.");
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }
    }

    //--------------------------------------------------------------------------------------------------
    // This method Check If Exists User by Email
    //--------------------------------------------------------------------------------------------------
    public int FindUser(string email)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            throw (ex);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@email", email);

        cmd = CreateCommandWithStoredProcedure("SP_FindUser", con, paramDic);             // create the command
        var returnParameter = cmd.Parameters.Add("@returnValue", SqlDbType.Int);
        returnParameter.Direction = ParameterDirection.ReturnValue;

        try
        {
            cmd.ExecuteNonQuery(); // execute the command
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }
        return (int)returnParameter.Value;
    }

    //--------------------------------------------------------------------------------------------------
    // This method Check If user password is valid
    //--------------------------------------------------------------------------------------------------
    public UserClass checkUserPassword(string email, string password)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            throw (ex);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@email", email);
        paramDic.Add("@password", password);

        cmd = CreateCommandWithStoredProcedure("SP_checkUserPassword", con, paramDic);
        UserClass u = new UserClass();
        try
        {
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            if (dataReader.Read())
            {
                u.id = Convert.ToInt32(dataReader["id"]);
                u.name = dataReader["name"].ToString();
                u.email = dataReader["email"].ToString();
                u.password = dataReader["password"].ToString();
                return u;
            }
            return null;
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }

    }

    //--------------------------------------------------------------------------------------------------
    // This method Insert a song to userSongs table
    //--------------------------------------------------------------------------------------------------
    public bool addSongToFav(int userId, int songId)
    {
        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();

        paramDic.Add("@userId", userId);
        paramDic.Add("@songId", songId);

        cmd = CreateCommandWithStoredProcedure("SP_addSongToFav", con, paramDic);// create the command

        try
        {
            int numEffected = cmd.ExecuteNonQuery(); // execute the command
            return numEffected>0;
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }

    }

    //--------------------------------------------------------------------------------------------------
    // This method Delete a song to userSongs table
    //--------------------------------------------------------------------------------------------------
    public bool deleteSongFromFav(int userId, int songId)
    {
        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();

        paramDic.Add("@userId", userId);
        paramDic.Add("@songId", songId);

        cmd = CreateCommandWithStoredProcedure("SP_deleteSongFromFav", con, paramDic);// create the command

        try
        {
            int numEffected = cmd.ExecuteNonQuery(); // execute the command
            return numEffected>0;
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }

    }
    //*****************************************************Songs Methods*********************************************************************************
    //--------------------------------------------------------------------------------------------------
    // This method add new song to db
    //--------------------------------------------------------------------------------------------------
    public int InsertSong(Song s)
    {
        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();

        paramDic.Add("@name", s.name);
        paramDic.Add("@artistName", s.artistName);
        paramDic.Add("@link", s.link);
        paramDic.Add("@lyrics", s.lyrics);



        cmd = CreateCommandWithStoredProcedure("SP_Insert_Song", con, paramDic);// create the command

        try
        {
            int numEffected = cmd.ExecuteNonQuery(); // execute the command
            //int numEffected = Convert.ToInt32(cmd.ExecuteScalar()); // returning the id
            return numEffected;
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }

    }
    //--------------------------------------------------------------------------------------------------
    // This method Reads all Songs
    //--------------------------------------------------------------------------------------------------
    public List<Song> getAllSongs()
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }


        cmd = CreateCommandWithStoredProcedure("SP_getAllSongs", con, null);// create the command


        List<Song> songList = new List<Song>();

        try
        {
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            while (dataReader.Read())
            {
                Song s = new Song();
                s.id = Convert.ToInt32(dataReader["Id"]);
                s.name = dataReader["name"].ToString();
                s.artistName = dataReader["artistName"].ToString();
                s.link = dataReader["link"].ToString();
                s.lyrics = dataReader["lyrics"].ToString();
                s.rate = Convert.ToInt32(dataReader["rate"]);
                songList.Add(s);
            }
            return songList;
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }

    }
    //--------------------------------------------------------------------------------------------------
    // This method return random song
    //--------------------------------------------------------------------------------------------------
    public List<Song> getRandomSong()
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }


        cmd = CreateCommandWithStoredProcedure("SP_getRandomSong", con, null);// create the command


        List<Song> songList = new List<Song>();

        try
        {
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            while (dataReader.Read())
            {
                Song s = new Song();
                s.id = Convert.ToInt32(dataReader["Id"]);
                s.name = dataReader["name"].ToString();
                s.artistName = dataReader["artistName"].ToString();
                s.link = dataReader["link"].ToString();
                s.lyrics = dataReader["lyrics"].ToString();
                s.rate = Convert.ToInt32(dataReader["rate"]);
                songList.Add(s);
            }
            return songList;
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }

    }
    //--------------------------------------------------------------------------------------------------
    // This method return song by name
    //--------------------------------------------------------------------------------------------------
    public Song getSongByName(string songName)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }
        Dictionary<string, object> paramDic = new Dictionary<string, object>();

        paramDic.Add("@name", songName);
       

        cmd = CreateCommandWithStoredProcedure("SP_getSongByName", con, paramDic);// create the command


        try
        {
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            if (dataReader.Read())
            {
                Song s = new Song();
                s.id = Convert.ToInt32(dataReader["Id"]);
                s.name = dataReader["name"].ToString();
                s.artistName = dataReader["artistName"].ToString();
                s.link = dataReader["link"].ToString();
                s.lyrics = dataReader["lyrics"].ToString();
                s.rate = Convert.ToInt32(dataReader["rate"]);

                return s;
            }
            throw new Exception("could not find Song");
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }

    }

    //--------------------------------------------------------------------------------------------------
    // This method return song by lyrics
    //--------------------------------------------------------------------------------------------------
    public List<Song> getByLyrics(string lyrics)
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@lyrics", lyrics);


        cmd = CreateCommandWithStoredProcedure("SP_getByLyrics", con, paramDic);// create the command


        List<Song> songList = new List<Song>();

        try
        {
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            while (dataReader.Read())
            {
                Song s = new Song();
                s.id = Convert.ToInt32(dataReader["Id"]);
                s.name = dataReader["name"].ToString();
                s.artistName = dataReader["artistName"].ToString();
                s.link = dataReader["link"].ToString();
                s.lyrics = dataReader["lyrics"].ToString();
                s.rate = Convert.ToInt32(dataReader["rate"]);
                songList.Add(s);
            }
            if(songList.Count>0)
            return songList;
            throw new Exception("could not find Song");
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }

    }
    //*****************************************************Artists Methods*********************************************************************************
    //--------------------------------------------------------------------------------------------------
    // This method Returns all Artists
    //--------------------------------------------------------------------------------------------------
    public List<Artist> getAllArtists()
    {

        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }


        cmd = CreateCommandWithStoredProcedure("SP_getAllArtists", con, null);// create the command


        List<Artist> artistList = new List<Artist>();

        try
        {
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            while (dataReader.Read())
            {
                Artist a = new Artist();
                a.id = Convert.ToInt32(dataReader["Id"]);
                a.name = dataReader["name"].ToString();
                a.rate = Convert.ToInt32(dataReader["rate"]);
                artistList.Add(a);
            }
            return artistList;
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }

    }

    //--------------------------------------------------------------------------------------------------
    // This method return songs by artist
    //--------------------------------------------------------------------------------------------------
    public List<Song> getSongsByArtist(string artistName)
    {
        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // create the connection
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@artistName", artistName);

        cmd = CreateCommandWithStoredProcedure("SP_getSongsByArtist", con, paramDic);// create the command


        List<Song> songList = new List<Song>();

        try
        {
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            while (dataReader.Read())
            {
                Song s = new Song();
                s.id = Convert.ToInt32(dataReader["id"]);
                s.name = dataReader["name"].ToString();
                s.artistName = dataReader["artistName"].ToString();
                s.link = dataReader["link"].ToString();
                s.lyrics = dataReader["lyrics"].ToString();
                s.rate = Convert.ToInt32(dataReader["rate"]);
                songList.Add(s);
            }
            if(songList.Count > 0)
            {
            return songList;
            }
            throw new Exception("No Songs from this Artist");
        }
        catch (Exception ex)
        {
            // write to log
            throw (ex);
        }

        finally
        {
            if (con != null)
            {
                // close the db connection
                con.Close();
            }
        }
    }
}