using System;
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
    public Song getRandomSong()
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
    // This method return random song
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

    public Song getByLyrics(string lyrics)
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
}