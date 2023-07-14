const baseApi = 'https://localhost:7091/api';

$(document).ready(() => {
    ///Artists////

    $("#showAllArtistsBtn").click(function () {
        $("#searchArtistInput").val("");
        renderArtists();
    })

    $("#showFavoritesArtists").click(function () {
        $("#searchArtistInput").val("");
        if (localStorage.user !== undefined) {
            const userId = JSON.parse(localStorage.user).id;
            ajaxCall("GET", baseApi + `/Users/${userId}/artists`, "", successCBAllArtists, errorCB);
        }
        else {
            Swal.fire({
                icon: 'error',
                text: "You need to login first to see your favorites artists",
                color: 'white',
                background: '#171717'
            })
        }
    })

    function renderArtists() {
        // if (localStorage.artists == undefined)
            ajaxCall("GET", baseApi + `/Artists`, "", successCBAllArtists, errorCB);
        // else {
        //   const artistsDiv = document.getElementById("artists");
        //   const data = JSON.parse(localStorage.artists);
        //   addArtistsToDiv(data);
        // }
    }
    renderArtists();

    $("#searchArtistForm").submit((event) => {
        event.preventDefault();
        var inputVal = $("#searchArtistInput").val().toLowerCase();
        const data = JSON.parse(localStorage.artists);
        let filteredData = data;
        if (inputVal !== '') {
            filteredData = data.filter(artist => artist.name.toLowerCase().startsWith(inputVal));
        }
        const artistsDiv = document.getElementById("artists");
        artistsDiv.innerHTML = "";
        if (data.length > 0) {
            for (let artist of filteredData) {
                addArtistsToDiv(artist);
            }
        }
        else {
            artistsDiv.innerHTML = "<p>Artist Not Found.</p>";
        }
    })

    function getArtist(id) {
        let artist;
        $.ajax({
            async: false,
            type: "GET",
            url: baseApi + `/Artists/${id}/info`,
            data: "",
            cache: false,
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                artist = data;
            },
            error: errorCB
        });
        return artist;
    }

    $(document).on("click", ".back", function (event) {
        event.preventDefault();
        const name = $(event.target).closest(".artist").find("h4").text();
        const data = JSON.parse(localStorage.artists);
        const currArtist = data.filter(artist => artist.name === name)[0];
        const swal = Swal.fire({
            title: `About ${currArtist.name}`,
            html: `<div class="song-popup">${currArtist.summary}</div> <i id="artist_${currArtist.artistId}" class="fa fa-heart-o addToFavorite" title="Add To Favorite" style="color:white;"></i><p id="removeArtistFromFav" title="Remove From Favorite">&#x1F494;</p><br><a id="artistSongsDetails">click here for songs of ${currArtist.name}</a>`,
            color: 'white',
            background: '#171717',
            confirmButtonText: "Close",
        });
        $("#artistSongsDetails").click(() => {
            event.preventDefault();
            const songsDiv = $("<div>");
            for (let song of currArtist.songsList) {
                songsDiv.append(`<p>${song.name}</p>`);
            }
            swal.update({
                title: `Songs of ${currArtist.name}`,
                html: songsDiv
            });
        })
        $(`#artist_${currArtist.artistId}`).click(() => {
            if (localStorage.user === undefined) {
                Swal.fire({
                    icon: 'error',
                    text: "Please Log in to add artist to Favorites",
                    color: 'white',
                    background: '#171717'
                })
                return;
            }
            ajaxCall("POST", baseApi + `/Users/${JSON.parse(localStorage.user).id}/addArtistToFav/${currArtist.artistId}`, "", function () {
                Swal.fire({
                    icon: 'success',
                    text: "Artist added to your Favorites",
                    color: 'white',
                    background: '#171717'
                })
                const artistDiv = $(".back").filter(function () {
                    return $(this).find("h4").text() === currArtist.name;
                });
                let artist = getArtist(currArtist.artistId);
                artistDiv.find("p").last().html(`&#x1F44D; ${artist.rate}`);
            }, errorCB);
        })

        $('#removeArtistFromFav').click(() => {
            if (localStorage.user === undefined) {
                Swal.fire({
                    icon: 'error',
                    text: "Please Log in to remove artist from Favorites",
                    color: 'white',
                    background: '#171717'
                })
                return;
            }
            ajaxCall("DELETE", baseApi + `/Users/${JSON.parse(localStorage.user).id}/removeArtistFromFav/${currArtist.artistId}`, "", function () {
                Swal.fire({
                    icon: 'success',
                    text: "Artist removed from your Favorites",
                    color: 'white',
                    background: '#171717'
                })
                const artistDiv = $(".back").filter(function () {
                    return $(this).find("h4").text() === currArtist.name;
                });
                let artist = getArtist(currArtist.artistId);
                artistDiv.find("p").last().html(`&#x1F44D; ${artist.rate}`);
            }, errorCB);
        })
    });

    ////////////////////////login and register///////////////////
    let updateLoginPage = (page) => {
        $("#mainFormDiv").html("");
        if (page === "logout") {//logout page
            if (JSON.parse(localStorage.user).email === "admin@gmail.com") {

                $("#adminBtns").html(`<span>Access to data Tables: </span><a class="adminButton" href="./usersTable.html" target="_blank">Users Data</a>
                <a class="adminButton" href="./songsTable.html" target="_blank">Songs Data</a>
                <a class="adminButton" href="./artistsTable.html" target="_blank">Artists Data</a>`);
                $("#mainPageHeader").html("Hello Admin");
            }
            $("#mainFormDiv").append('<h2 id="formHeader1" >Are you sure you want to logout?</h2><button id="logoutBtn" class="btnbtn">Log Out</button>');
            $("#logoutBtn").click(() => {
                localStorage.removeItem("user");
                Swal.fire({
                    icon: 'success',
                    text: "You Logged Out!",
                    color: 'white',
                    background: '#171717',
                }).then(() => {
                    updateLoginBtns();
                    window.location.href = "./index.html";
                })
            })
        }
        else if (page === "login") { //login page
            $("#mainFormDiv").append('<h2 id="formHeader2">Log in to enjoy your music</h2><form id="loginForm" class="work-request"><div id="formDiv" class="work-request--information"><div class="information-email"><input id="logEmailInp" type="email" spellcheck="false" placeHolder="Email" title="example12@example.exapmle" required></div><div class="information-name"><input id="logPassInp" type="text" spellcheck="false" placeholder="Password" title="password must has a minimum of 6 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number, with no spaces." required></div></div><input type="submit" value="Log In"></form>');
            $('#logEmailInp').attr('pattern', "^((?!\\.)[\\w-_.]*[^.])(@\\w+)(\\.\\w+(\\.\\w+)?[^.\\W])$");
            $('#loginForm').submit(function () {
                let email = $("#logEmailInp").val();
                let password = $("#logPassInp").val();
                User = {
                    id: 0,
                    name: "string",
                    email: email,
                    password: password,
                    regDate: "2023-06-10T12:33:08.383Z"
                }
                ajaxCall("POST", baseApi + "/Users/login", JSON.stringify(User), successCBLogin, errorCBLogin);
                return false;
            })
        }
        else { //signup page
            $("#mainFormDiv").append('<h2 id="formHeader3">Sign up to enjoy new music</h2><form id="signUpForm" class="work-request"><div id="formDiv" class="work-request--information"><div class="information-name"><input id="regNameInp" type="text" spellcheck="false" placeholder="Name" title="name must include only letters" required ></div><div class="information-email"><input id="regEmailInp" type="email" spellcheck="false" placeholder="Email" title="example12@example.exapmle" required></div><div class="information-name"><input id="regPassInp" type="text" spellcheck="false" placeholder="Password" title="password should has a minimum of 6 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number, with no spaces." required></div></div><input type="submit" value="Sign Up"></form>');
            $('#regNameInp').attr('pattern', '[a-zA-Z]+');
            $('#regEmailInp').attr('pattern', "^((?!\\.)[\\w-_.]*[^.])(@\\w+)(\\.\\w+(\\.\\w+)?[^.\\W])$");
            $('#regPassInp').attr('pattern', "^((?=\\S*?[A-Z])(?=\\S*?[a-z])(?=\\S*?[0-9]).{5,})\\S$");
            $('#signUpForm').submit(function () {
                let email = $("#regEmailInp").val();
                let password = $("#regPassInp").val();
                let name = $("#regNameInp").val();
                let currentDateTime = new Date();
                let formattedDateTime = currentDateTime.toISOString();
                User = {
                    id: 0,
                    name: name,
                    email: email,
                    password: password,
                    regDate: formattedDateTime
                }
                ajaxCall("POST", baseApi + "/Users/register", JSON.stringify(User), successCBSignUp, errorCBLogin);
                return false;
            })
        }
    }

    let updateLoginBtns = () => {
        if (localStorage["user"] != undefined) { //user logged in
            $(".header--cta").html("Hello " + JSON.parse(localStorage["user"]).name);
            $("#loginLink").html('LOGOUT <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 150 118" style="enable-background:new 0 0 150 118;" xml:space="preserve"><g transform="translate(0.000000,118.000000) scale(0.100000,-0.100000)"><path d="M870,1167c-34-17-55-57-46-90c3-15,81-100,194-211l187-185l-565-1c-431,0-571-3-590-13c-55-28-64-94-18-137c21-20,33-20,597-20h575l-192-193C800,103,794,94,849,39c20-20,39-29,61-29c28,0,63,30,298,262c147,144,272,271,279,282c30,51,23,60-219,304C947,1180,926,1196,870,1167z" /></g></svg><span class="btn-background"></span>');
            $('#notMember').hide();
            $('#signUpLink').hide();
            $('.side-nav li:nth-child(6)').addClass('logout');
            $("#outBarLogin").html("Logout");
            updateLoginPage("logout");
        }
        else { //guest
            $(".header--cta").html("Hello Guest");
            $("#loginLink").html('Login <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 150 118" style="enable-background:new 0 0 150 118;" xml:space="preserve"><g transform="translate(0.000000,118.000000) scale(0.100000,-0.100000)"><path d="M870,1167c-34-17-55-57-46-90c3-15,81-100,194-211l187-185l-565-1c-431,0-571-3-590-13c-55-28-64-94-18-137c21-20,33-20,597-20h575l-192-193C800,103,794,94,849,39c20-20,39-29,61-29c28,0,63,30,298,262c147,144,272,271,279,282c30,51,23,60-219,304C947,1180,926,1196,870,1167z" /></g></svg><span class="btn-background"></span>');
            $('#notMember').show();
            $('#signUpLink').show();
            $('.side-nav li:nth-child(6)').removeClass('logout');
            $("#outBarLogin").html("Login");
            updateLoginPage("login");
        }
    }

    updateLoginBtns();
    updateLoginPage("login");

    $('#signUpLink').click(function () {
        updateLoginPage("signup");
    });

    $('#loginLi').click(function () {
        if (localStorage["user"] != undefined) { //user logged in
            updateLoginPage("logout");
        }
        else {
            updateLoginPage("login");
        }
    });

    $('#loginLink').click(function () {
        if (localStorage["user"] != undefined) { //user want to logOut
            localStorage.removeItem("user");
            Swal.fire({
                icon: 'success',
                text: "You Logged Out!",
                color: 'white',
                background: '#171717'
            })
            updateLoginBtns();
            window.location.href = "./index.html";
        }
        else { //user want to login
            updateLoginPage("login");
        }
    });

    function successCBLogin(data) {
        Swal.fire({
            icon: 'success',
            text: "You Logged In Successfully!",
            color: 'white',
            background: '#171717'
        })
        localStorage["user"] = JSON.stringify(data);
        window.location.href = "./index.html";
        updateLoginBtns();
    }

    function successCBSignUp(data) {
        Swal.fire({
            icon: 'success',
            text: "You Signed Up Successfully!",
            color: 'white',
            background: '#171717'
        })
        localStorage["user"] = JSON.stringify(data);
        window.location.href = "./index.html";
        updateLoginBtns();
    }
    function errorCBLogin(error) {
        let message = error.responseText;
        Swal.fire({
            icon: 'error',
            text: message,
            color: 'white',
            background: '#171717',
        })
    }
    /////QUIZ/////
    let score = 0;
    function renderQuestion(q) {
        let qArr = q();
        let answersArr = [` <div id="q_1" class="answerDiv">
                      <h3 style="display: inline-block;">${qArr[1]}</h3>
                    </div>`,
        ` <div id="q_2" class="answerDiv wrongAns">
                      <h3 style="display: inline-block;">${qArr[2]}</h3>
                    </div>`,
        ` <div id="q_3" class="answerDiv wrongAns">
                      <h3 style="display: inline-block;">${qArr[3]}</h3>
                    </div>`,
        `<div id="q_4" class="answerDiv wrongAns">
                      <h3 style="display: inline-block;">${qArr[4]}</h3>
                    </div>`]
        let randNums = []
        while (randNums.length < 4) {
            let r = Math.floor(Math.random() * answersArr.length)
            if (!randNums.includes(r)) randNums.push(r);
        }
        $("#Quiz").html(
            `<table id="myTable">
                  <thead>
                    <tr id="scoreTimer">
                      <th colspan="2">
                        <span id="playerScore">Score: ${score} Time left: &nbsp</span>
          <span id="timer">30</span>
                      </th>
                    </tr>
                    <tr>
                      <th colspan="2">
                        <div id="question">
                  <h3 style="display: inline-block;">${qArr[0]}</h3>
                </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody id="tableBody">
                    <tr>
                      <td class="answerTD">
                        ${answersArr[randNums[0]]}
                      </td>
                      <td class="answerTD">
                        ${answersArr[randNums[1]]}
                      </td>
                    </tr>
                    <tr>
                      <td class="answerTD">
                        ${answersArr[randNums[2]]}
                      </td>
                      <td class="answerTD">
                        ${answersArr[randNums[3]]}
                      </td>
                    </tr>
                  </tbody>
                </table>`)
        $('#q_1').on("click", function () {
            clearInterval(interval);
            alertAnswer('Correct!', 'success')
        });
        $('.wrongAns').on("click", function () {
            clearInterval(interval);
            alertAnswer('Wrong &#128531;', 'error')
        });
        const timerElement = document.getElementById('timer');
        let timeLeft = 30;
        timerElement.textContent = timeLeft;
        const interval = setInterval(() => {
            timeLeft--;
            if ($(".quizNav.is-active").length === 0) {
                clearInterval(interval);
                return;
            }
            timerElement.textContent = timeLeft;
            if (timeLeft === 0) {
                clearInterval(interval);
                timerElement.textContent = 'Time up!';
                alertAnswer('Wrong &#128531;', 'error')
            }
        }, 1000);

    }

    function alertAnswer(swalTitle, swalIcon) {
        if (swalIcon === "success")
            score += 25;
        Swal.fire({
            title: swalTitle,
            icon: swalIcon,
            timer: 2500,
            timerProgressBar: true,
            showConfirmButton: false,
            color: 'white',
            background: '#171717',
            didOpen: () => {
                timerInterval = setInterval(() => {
                }, 100)
            },
            willClose: () => {
                clearInterval(timerInterval)
            }
        }).then((result) => {
            if (result.dismiss) {
                manageQuiz();
            }
        })
    }

    let currentQuestionIndex = 0;
    let questionsQueue = [getQ3, getQ4, getQ5, getQ6, getQ7, getQ8];
    function manageQuiz() {
        if (currentQuestionIndex == questionsQueue.length) {
            $("#Quiz").html(`<div id="QuizoverDiv" class="about--banner"><h2 id="quizHeader">QUIZ OVER!</h2><h3 id="scoreOver">Your Score: ${score}</h3></div>`);
            $("#Quiz").append(`<button id="playAgain">Play Again</button>`);
            $("#Quiz").append(`<button id="leaderBoard">Leaders Board</button>`);
            $("#Quiz").append(`<div><img id="winnerImg" src="assets/img/winnerCup.png"></img></div>`);
            $("#playAgain").on('click', () => manageQuiz());
            $("#leaderBoard").on('click', () => {
                ajaxCall("GET", `${baseApi}/Users/leaders`, "", showLeadersboard, errorCB);
            });
            let userId = JSON.parse(localStorage["user"]).id;
            ajaxCall("POST", `${baseApi}/Users/${userId}/Score/${score}`, "", successCBScoreUpdate, errorCB);
            currentQuestionIndex = 0;
            score = 0
            return;
        }
        renderQuestion(questionsQueue[currentQuestionIndex++]);
    }
    $(".quizNav").click(() => {
        renderQuizHTML();
    });
    function showLeadersboard(leaders) {
        const leadersDiv = $("<div>");
        for (let leader of leaders) {
            leadersDiv.append(`<p>${leader.name}   -   ${leader.score}</p>`);
        }
        Swal.fire({
            icon: 'info',
            html: leadersDiv,
            color: 'white',
            background: '#171717'
        })

    }
    function renderQuizHTML() {
        const quizDiv = $("#Quiz");
        if (localStorage.user !== undefined) {
            quizDiv.html(`<div class="about--banner"><h2 id="quizHeader">Songs Quiz</h2></div>`);
            quizDiv.append(`<button id="startQuizBtn">Start Quiz</button>`);
            $("#startQuizBtn").on('click', () => {
                if (localStorage.artists === undefined) {
                    quizDiv.html(`<h1 id="Preparing">Preparing Your Quiz...</h1><span class="loader"></span>`)
                    const interval = setInterval(() => {
                        if (localStorage.artists) {
                            clearInterval(interval); // Clear the interval once localStorage.artists is available
                            manageQuiz();
                        }
                    }, 100);
                }
                else {
                    manageQuiz();
                }
            });
        } else {
            quizDiv.html(`<h1>You Must Login For Starting Quiz!</h1>`);
        }
    }

})
////////////////////////Favorites Songs///////////////////

function renderFavorites() {
    if (localStorage["user"] !== undefined) {
        let userId = JSON.parse(localStorage["user"]).id;
        ajaxCall("GET", `${baseApi}/Users/${userId}/songs`, "", successCBFavorites, errorCB);
    }
    else {
        $("#favoriteSongs").html("<h3>You should login first to see your favorite songs</h3>");
    }
}

function successCBFavorites(data) {
    if (data.length === 0) {
        $("#favoriteSongs").html("<h3>You don't have favorite songs</h3>");
    }
    else {
        let favoritesDiv = $("#favoriteSongs");
        favoritesDiv.html("");
        for (let song of data) {
            let songDiv = `<a id="a_${song.id}" class="favSong" title="Click to see song details">
            <h3 class="favTitle" style="display: inline-block;">${song.name}</h3>
            <p class="favP">${song.artistName}</p>
          </a>`;
            favoritesDiv.append(songDiv);
            $(`#a_${song.id}`).on("click", function () {
                Swal.fire({
                    title: `${song.name} Lyrics`,
                    html: `<div class="song-popup">${song.lyrics.replace(/\n/g, '<br>')}</div>
               <br>
               <i id="fav_${song.id}" class="fa fa-heart-o removeFromFavorite" title="Remove From Favorite" style="color:red;"></i>`,
                    color: 'white',
                    background: '#171717',
                    confirmButtonText: "Close",
                    didOpen: () => {
                        $('.song-popup').scrollTop(0);
                        $(`#fav_${song.id}`).click(function () {
                            ajaxCall("DELETE", baseApi + `/Users/${JSON.parse(localStorage.user).id}/${song.id}`, "", successCBRemoveFromFavorite, errorCB);
                        });
                    }
                });
            })
        }
    }
}
function successCBRemoveFromFavorite(data) {
    if (data === true) {
        Swal.fire({
            icon: 'success',
            text: "Song removed from your Favorites",
            color: 'white',
            background: '#171717'
        })
        renderFavorites();
        ajaxCall("GET", baseApi + `/Songs/randomSong`, "", successCBRandom, errorCB);
    }
}

///////////Artists/////////////////
const lastfmBaseAPi = "http://ws.audioscrobbler.com/2.0";
const lastfmKey = "d6293ebc904c9f3e71bf638f0b55a5f6";

function successCBAllArtists(data) {
    const artistsDiv = document.getElementById("artists");
    artistsDiv.innerHTML = "";
    const artistsArr = [];
    let songsList = [];
    let count = data.length;
    if (count > 0) {
        for (let artist of data) {
            const api = `${lastfmBaseAPi}/?method=artist.getinfo&artist=${artist.name}&api_key=${lastfmKey}&format=json`;
            ajaxCall("GET", api, "", function (data) {
                const artistObj = data.artist;
                const name = artistObj.name;
                const summary = artistObj.bio.summary;
                const listeners = artistObj.stats.listeners;
                const playcount = artistObj.stats.playcount;
                const rate = artist.rate;
                const artistId = artist.id;
                let image;
                $.ajax({
                    async: false,
                    type: "GET",
                    url: baseApi + `/Artists/${name}/songs`,
                    data: "",
                    cache: false,
                    contentType: "application/json",
                    dataType: "json",
                    success: function (data) {
                        songsList = data;
                    },
                    error: errorCB
                });
                $.ajax({
                    async: false,
                    type: "GET",
                    url: baseApi + `/Artists/${name}/image`,
                    data: "",
                    cache: false,
                    contentType: "application/json",
                    dataType: "json",
                    success: function (artistD) {
                        image = artistD.data[0].picture_medium;
                    },
                    error: errorCB
                });
                const res = { artistId, name, summary, listeners, playcount, rate, image, songsList};
                $("#artistLoader").hide();
                addArtistsToDiv(res);
                artistsArr.push(res);
                count -= 1;
                if (count === 0) {
                    localStorage.artists = JSON.stringify(artistsArr);
                }
            }, function (error) {
                errorCB(error);
            });
        }
    }
    else {
        $("#artistLoader").hide();
        artistsDiv.innerHTML = "<p>Artist Not Found.</p>";
    }
}

function addArtistsToDiv(artist) {
    const artistsDiv = document.getElementById("artists");
    artistsDiv.innerHTML += `<div class="artist">
                 <div class="front">
                 <img src=${artist.image}>
             </div>
             <div class="back">
                 <h4>${artist.name}</h4>
                 <p>listeners: ${artist.listeners}</p>
                 <p>playcount: ${artist.playcount}</p>
                 <p>&#x1F44D; ${artist.rate}</p>
             </div>
             </div>`;
}

//////////Quiz/////////////
const start = 0;
const end = 50;
//random artist
function randomArtist() {
    if (localStorage.artists !== undefined) {
        const artists = JSON.parse(localStorage.artists);
        const rand = Math.floor(Math.random() * artists.length);
        const artistName = artists[rand].name;

        return artistName;
    }
}

//3 random songs of artist
function getArtistSongs(artistName) {
    let songsList = []; // here will be 3 songs of the artist
    $.ajax({
        async: false,
        type: "GET",
        url: baseApi + `/Artists/${artistName}/songs`,
        data: "",
        cache: false,
        contentType: "application/json",
        dataType: "json",
        success: function (data) {
            for (let i = 0; i < 3; i++) {
                let rand = Math.floor(Math.random() * data.length);
                let song = data[rand];
                while (songsList.includes(song)) {
                    rand = Math.floor(Math.random() * data.length);
                    song = data[rand];
                }
                songsList.push(song);
            }
        },
        error: errorCB
    });
    return songsList;
}

//song of different artist
function getRandomSongOfDifferentArtist(artistName) {
    let song;
    const artists = JSON.parse(localStorage.artists);
    const filteredArtists = artists.filter(artist => artist.name !== artistName);
    const rand = Math.floor(Math.random() * filteredArtists.length);
    const differentArtist = filteredArtists[rand].name;
    $.ajax({
        async: false,
        type: "GET",
        url: baseApi + `/Artists/${differentArtist}/songs`,
        data: "",
        cache: false,
        contentType: "application/json",
        dataType: "json",
        success: function (data) {
            const rand = Math.floor(Math.random() * data.length);
            song = data[rand];
        },
        error: errorCB
    });
    return song;
}

//3 sentences of different songs of artist
function getSongsSentences(artistName) {
    const songs = getArtistSongs(artistName);
    const sentences = [];
    for (let song of songs) {
        let sentence = song.lyrics.substring(start, end);
        sentences.push(sentence);
    }
    return sentences;
}

function getSongsSentenceOFDifferentArtist(artistName) {
    const song = getRandomSongOfDifferentArtist(artistName);
    let sentence = song.lyrics.substring(start, end);

    return sentence;
}

//return 3 random songs different from songName
function getDifferentSongs(songName) {
    let songsList = [];
    $.ajax({
        async: false,
        type: "GET",
        url: baseApi + `/Songs/diffRandomSongs/${songName}`,
        data: "",
        cache: false,
        contentType: "application/json",
        dataType: "json",
        success: function (data) {
            songsList = data;
        },
        error: errorCB
    });
    return songsList;
}

function getQ3() {
    let q3 = [];
    const artistName = randomArtist();
    const question = "Which of the following songs is not by " + artistName + "?";
    q3.push(question);
    q3.push(getRandomSongOfDifferentArtist(artistName).name);
    const songs = getArtistSongs(artistName);
    q3.push(songs[0].name, songs[1].name, songs[2].name);

    return q3;
}

function getQ4() {
    let q4Arr = [];
    $.ajax({
        async: false,
        type: "GET",
        url: baseApi + `/Songs/randomSong`,
        data: "",
        cache: false,
        contentType: "application/json",
        dataType: "json",
        success: function (songs) {

            const randInt = Math.floor(Math.random() * 3)
            const songName = songs[randInt].name;
            const songArtist = songs[randInt].artistName
            q4Arr.push(`Who is the singer of: ${songName} ?`, songArtist)
            q4Arr.push(...generateDiff3Artists(songArtist))
        },
        error: errorCB
    });
    return q4Arr;
}

function getQ5() {
    let q5Arr = [];
    $.ajax({
        async: false,
        type: "GET",
        url: baseApi + `/Songs/randomSong`,
        data: "",
        cache: false,
        contentType: "application/json",
        dataType: "json",
        success: function (songs) {

            const randInt = Math.floor(Math.random() * 3)
            const songLyrics = songs[randInt].lyrics.substring(start, end)
            const songArtist = songs[randInt].artistName
            q5Arr.push(`Who sang: ${songLyrics} ?`, songArtist)
            q5Arr.push(...generateDiff3Artists(songArtist))
        },
        error: errorCB
    });
    return q5Arr;
}

function getQ6() {
    let q6 = [];
    const artistName = randomArtist();
    const question = "Which of the following sentences is not part of " + artistName + "'s song?";
    q6.push(question);
    q6.push(getSongsSentenceOFDifferentArtist(artistName));
    q6.push(...getSongsSentences(artistName));

    return q6;
}

function getQ7() {
    let q7 = [];
    const artistName = randomArtist();
    const song = getArtistSongs(artistName)[0];//random song
    const sentence = song.lyrics.substring(start, end);
    const question = `From which song is the following sentence taken? ${sentence}`;
    const answer = song.name;
    q7.push(question.split("\n")[0]);
    q7.push(answer);
    const songs = getDifferentSongs(answer);
    q7.push(songs[0].name, songs[1].name, songs[2].name);

    return q7;
}

function getQ8() {
    let q6Arr = [];
    $.ajax({
        async: false,
        type: "GET",
        url: baseApi + `/Songs/randomSong`,
        data: "",
        cache: false,
        contentType: "application/json",
        dataType: "json",
        success: function (songs) {

            const randInt = Math.floor(Math.random() * 3)
            const songName = songs[randInt].name;
            const songLyrics = songs[randInt].lyrics.substring(start, end)
            const songArtist = songs[randInt].artistName
            q6Arr.push(`Which one of the lyrics is from: ${songName} ?`, songLyrics)
            let diffArtist = []
            diffArtist.push(...generateDiff3Artists(songArtist))
            for (let i = 0; i < 3; i++) {
                let lyrics = getArtistSongs(diffArtist[i])[0].lyrics.substring(start, end)
                q6Arr.push(lyrics)
            }
        },
        error: errorCB
    });
    return q6Arr;
}

function errorCB(error) {
    let message = error.responseText;
    Swal.fire({
        icon: 'error',
        text: message,
        color: 'white',
        background: '#171717'
    })
}


/********************************************OFEK***************************************/
$(document).ready(() => {
    //generate random songs
    ajaxCall("GET", baseApi + `/Songs/randomSong`, "", successCBRandom, errorCB);
    //////////add filters 
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="song-option"]');
    // Add event listener to each checkbox
    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            // Uncheck all checkboxes except the current one
            checkboxes.forEach(function (cb) {
                if (cb !== checkbox) {
                    cb.checked = false;
                }
            });
        });
    });
    $(".song-option").on("click", function () {
        if (this.value === "allSongs") {
            $(".searchInput").hide()
            $("#searchBtn").hide()
            $(".microphone-button").hide()
        }
        else {
            $(".searchInput").show()
            $("#searchBtn").show()
            $(".microphone-button").show()
        }
    })
    $(".allSongs").on("click", function () {
        ajaxCall("GET", baseApi + `/Songs`, "", successCBSong, errorCB);
    })
    $(".allSongs").click();
    $("#searchForm").submit(() => {
        let checkedValue = document.querySelector('input[name="song-option"]:checked');
        let serachApi;
        let userInput = $('#searchInput').val();
        if (userInput == "") {
            Swal.fire({
                icon: 'error',
                text: "Please enter a valid input",
                color: 'white',
                background: '#171717'
            })
            return false;
        }
        if (checkedValue === null) {
            Swal.fire({
                icon: 'error',
                text: "Please Select a Filter",
                color: 'white',
                background: '#171717'
            });
            return false;
        }
        checkedValue = checkedValue.value
        switch (checkedValue) {
            case "songName":
                serachApi = baseApi + `/Songs/${userInput}/info`
                break;
            case "artist":
                serachApi = baseApi + `/Artists/${userInput}/songs`
                break;
            case "lyrics":
                serachApi = baseApi + `/Songs/songBylyrics?lyrics=${userInput}`
                break;
            case "allSongs":
                serachApi = baseApi + `/Songs`
                break;
            default: return false;
        }
        ajaxCall("GET", serachApi, "", successCBSong, errorCB);
        return false;
    })

    $(document).on("click", ".randSongs", function () {
        if (localStorage.user === undefined) {
            Swal.fire({
                icon: 'error',
                text: "Please Log in to add song to Favorites",
                color: 'white',
                background: '#171717'
            })
            return;
        }
        this.querySelector(".fa-heart-o").style.color = "red";
        ajaxCall("POST", baseApi + `/Users/${JSON.parse(localStorage.user).id}/${this.id.split("_")[1]}`, "", successCBAddToFavorite, errorCB);
    })



})
function successCBScoreUpdate() {
    console.log('score updated');
}
function successCBAddToFavorite() {
    Swal.fire({
        icon: 'success',
        text: "Song added to your Favorites",
        color: 'white',
        background: '#171717'
    })
}
runSpeechRecog = () => {
    var output = $("#searchInput");
    let recognization = new webkitSpeechRecognition();
    recognization.onstart = () => {
        output.val("Listening...");
    }
    recognization.onresult = (e) => {
        var transcript = e.results[0][0].transcript;
        output.val(transcript);
    }
    recognization.start();
}

function successCBSong(data) {
    $("#songs").html("")
    if (data.length === undefined) {//single song returned as object and not array
        $("#songs").append(`
                  <div class="work--lockup">
                    <ul class="slider">
                      <li class="slider--item slider--item-center" id="slideSong_${data.id}">
                        <a>
                          <div class="slider--item-image">
                            <img src="assets/img/work-metiew-smith.jpg" alt="Metiew and Smith">
                          </div>
                          <p class="slider--item-title">${data.name}</p>
                          <p class="slider--item-description">${data.artistName}</p>
                        </a>
                      </li>
                    </ul>
                  </div>`)
        $(`#slideSong_${data.id}`).click(function () {
            showSongPopup(data.id, data.name);
        });
    }
    else {
        $("#songs").append(`
           <div class="work--lockup">
            <ul class="slider"> </ul>
              </div>`)
        $("div.work--lockup>ul.slider").append(`
    <li class="slider--item slider--item-center" id="slideSong_${data[0].id}">
        <a>
            <div class="slider--item-image">
                <img src="assets/img/work-victory.jpg" alt="Victory">
            </div>
            <p class="slider--item-title">${data[0].name}</p>
            <p class="slider--item-description">${data[0].artistName}</p>
        </a>
    </li>`)
        $(`#slideSong_${data[0].id}`).click(function () {
            showSongPopup(data[0].id, data[0].name);
        });
        if (data.length > 1) {
            $("div.work--lockup>ul.slider").append(`<li class="slider--item slider--item-left" id="slideSong_${data[1].id}">
            <a>
              <div class="slider--item-image">
                <img src="assets/img/work-metiew-smith.jpg" alt="Metiew and Smith">
              </div>
             <p class="slider--item-title">${data[1].name}</p>
             <p class="slider--item-description">${data[1].artistName}</p>
            </a>
          </li>`)
            $(`#slideSong_${data[1].id}`).click(function () {
                showSongPopup(data[1].id, data[1].name);
            });
        }
        if (data.length > 2) {
            $("div.work--lockup>ul.slider").append(`<li class="slider--item slider--item-right" id="slideSong_${data[2].id}">
          <a>
            <div class="slider--item-image">
              <img src="assets/img/work-alex-nowak.jpg" alt="Alex Nowak">
            </div>
            <p class="slider--item-title">${data[2].name}</p>
            <p class="slider--item-description">${data[2].artistName}</p>
            </a>
            </li>`)
            $(`#slideSong_${data[2].id}`).click(function () {
                showSongPopup(data[2].id, data[2].name);
            });
        }
        for (let i = 3; i < data.length; i++) {
            $("div.work--lockup>ul.slider").append(`<li class="slider--item" id="slideSong_${data[i].id}">
          <a>
            <div class="slider--item-image">
              <img src="assets/img/work-alex-nowak.jpg" alt="Alex Nowak">
            </div>
            <p class="slider--item-title">${data[i].name}</p>
            <p class="slider--item-description">${data[i].artistName}</p>
          </a>
             </li> `)
            $(`#slideSong_${data[i].id}`).click(function () {
                showSongPopup(data[i].id, data[i].name);
            });
        }
        if (data.length > 2) {
            $("div.work--lockup").append(`<div class="slider--prev">
          <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 150 118"
                        style="enable-background:new 0 0 150 118;" xml:space="preserve">
                        <g transform="translate(0.000000,118.000000) scale(0.100000,-0.100000)">
                          <path d="M561,1169C525,1155,10,640,3,612c-3-13,1-36,8-52c8-15,134-145,281-289C527,41,562,10,590,10c22,0,41,9,61,29
                      c55,55,49,64-163,278L296,510h575c564,0,576,0,597,20c46,43,37,109-18,137c-19,10-159,13-590,13l-565,1l182,180
                      c101,99,187,188,193,199c16,30,12,57-12,84C631,1174,595,1183,561,1169z" />
                        </g></svg></div>
                        <div class="slider--next"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 150 118"
                        style="enable-background:new 0 0 150 118;" xml:space="preserve">
                        <g transform="translate(0.000000,118.000000) scale(0.100000,-0.100000)">
                          <path d="M870,1167c-34-17-55-57-46-90c3-15,81-100,194-211l187-185l-565-1c-431,0-571-3-590-13c-55-28-64-94-18-137c21-20,33-20,597-20h575l-192-193C800,103,794,94,849,39c20-20,39-29,61-29c28,0,63,30,298,262c147,144,272,271,279,282c30,51,23,60-219,304C947,1180,926,1196,870,1167z" />
                        </g></svg></div>`)
        }
        workSlider();
    }
}
function showSongPopup(songId, songName) {
    ajaxCall("GET", baseApi + `/Songs/${songName}/info`, "", successCBSongLyrics, errorCB);
}

function successCBSongLyrics(data) {
    Swal.fire({
        title: `${data.name} Lyrics`,
        html: `<p>&#x1F44D; ${data.rate}</p>
        <div class="song-popup">${data.lyrics.replace(/\n/g, '<br>')}</div>
               <br>
               <i id="song_${data.id}" class="fa fa-heart-o addToFavorite" title="Add To Favorite" style="color:white;"></i>`,
        color: 'white',
        background: '#171717',
        confirmButtonText: "Close",
        didOpen: () => {
            $('.song-popup').scrollTop(0);
            $(`#song_${data.id}`).click(function () {
                if (localStorage.user === undefined) {
                    Swal.fire({
                        icon: 'error',
                        text: "Please Log in to add song to Favorites",
                        color: 'white',
                        background: '#171717'
                    })
                    return;
                }
                ajaxCall("POST", baseApi + `/Users/${JSON.parse(localStorage.user).id}/${data.id}`, "", successCBAddToFavorite, errorCB);
            });
        }
    });
}


function workSlider() {

    $('.slider--prev, .slider--next').click(function () {

        var $this = $(this),
            curLeft = $('.slider').find('.slider--item-left'),
            curLeftPos = $('.slider').children().index(curLeft),
            curCenter = $('.slider').find('.slider--item-center'),
            curCenterPos = $('.slider').children().index(curCenter),
            curRight = $('.slider').find('.slider--item-right'),
            curRightPos = $('.slider').children().index(curRight),
            totalWorks = $('.slider').children().length,
            $left = $('.slider--item-left'),
            $center = $('.slider--item-center'),
            $right = $('.slider--item-right'),
            $item = $('.slider--item');
        $('.slider').animate({ opacity: 0 }, 400);

        setTimeout(function () {

            if ($this.hasClass('slider--next')) {
                if (curLeftPos < totalWorks - 1 && curCenterPos < totalWorks - 1 && curRightPos < totalWorks - 1) {
                    $left.removeClass('slider--item-left').next().addClass('slider--item-left');
                    $center.removeClass('slider--item-center').next().addClass('slider--item-center');
                    $right.removeClass('slider--item-right').next().addClass('slider--item-right');
                }
                else {
                    if (curLeftPos === totalWorks - 1) {
                        $item.removeClass('slider--item-left').first().addClass('slider--item-left');
                        $center.removeClass('slider--item-center').next().addClass('slider--item-center');
                        $right.removeClass('slider--item-right').next().addClass('slider--item-right');
                    }
                    else if (curCenterPos === totalWorks - 1) {
                        $left.removeClass('slider--item-left').next().addClass('slider--item-left');
                        $item.removeClass('slider--item-center').first().addClass('slider--item-center');
                        $right.removeClass('slider--item-right').next().addClass('slider--item-right');
                    }
                    else {
                        $left.removeClass('slider--item-left').next().addClass('slider--item-left');
                        $center.removeClass('slider--item-center').next().addClass('slider--item-center');
                        $item.removeClass('slider--item-right').first().addClass('slider--item-right');
                    }
                }
            }
            else {
                if (curLeftPos !== 0 && curCenterPos !== 0 && curRightPos !== 0) {
                    $left.removeClass('slider--item-left').prev().addClass('slider--item-left');
                    $center.removeClass('slider--item-center').prev().addClass('slider--item-center');
                    $right.removeClass('slider--item-right').prev().addClass('slider--item-right');
                }
                else {
                    if (curLeftPos === 0) {
                        $item.removeClass('slider--item-left').last().addClass('slider--item-left');
                        $center.removeClass('slider--item-center').prev().addClass('slider--item-center');
                        $right.removeClass('slider--item-right').prev().addClass('slider--item-right');
                    }
                    else if (curCenterPos === 0) {
                        $left.removeClass('slider--item-left').prev().addClass('slider--item-left');
                        $item.removeClass('slider--item-center').last().addClass('slider--item-center');
                        $right.removeClass('slider--item-right').prev().addClass('slider--item-right');
                    }
                    else {
                        $left.removeClass('slider--item-left').prev().addClass('slider--item-left');
                        $center.removeClass('slider--item-center').prev().addClass('slider--item-center');
                        $item.removeClass('slider--item-right').last().addClass('slider--item-right');
                    }
                }
            }

        }, 400);

        $('.slider').animate({ opacity: 1 }, 400);

    });

}

function successCBRandom(data) {
    let songsCards = document.querySelectorAll(".randSongs");
    let ids = [];
    for (let i = 0; i < 3; i++) {
        songsCards[i].id = `rand_${data[i].id}`;
        songsCards[i].querySelector(".randTitle").innerHTML = data[i].name;
        songsCards[i].querySelector(".randPara").innerHTML = data[i].artistName;
        ids.push(data[i].id);
    }
    if (localStorage.user !== undefined) {
        let userId = JSON.parse(localStorage["user"]).id;
        ajaxCall("GET", `${baseApi}/Users/${userId}/songs`, "", function (responseData) {
            successCBFavRand(ids, responseData); // Pass the responseData to successCBFavRand
        }, errorCB);
    }
}

function successCBFavRand(ids, data) {
    const randomSongs = document.querySelectorAll(".randSongs");
    randomSongs.forEach(song => {
        document.getElementById(song.id).querySelector("i.fa.fa-heart-o").style.color = "white";
    });
    const matchingSongs = data.filter(song => ids.includes(song.id));
    matchingSongs.forEach(matchingSong => {
        document.getElementById(`rand_${matchingSong.id}`).querySelector("i.fa.fa-heart-o").style.color = "red";
    });
}

function errorCB(error) {
    let message = error.responseText;
    Swal.fire({
        icon: 'error',
        text: message,
        color: 'white',
        background: '#171717'
    })
}
///////////QUIZ/////////

//generates 3 different artst other than given songArtist
function generateDiff3Artists(songArtist) {
    const data = JSON.parse(localStorage.artists);
    const artistsArr = []
    const arr = []
    const diffArtists = data.filter(artist => artist.name !== songArtist);
    while (arr.length < 3) {
        let r = Math.floor(Math.random() * diffArtists.length);
        if (!arr.includes(r)) arr.push(r);
    }
    return ([diffArtists[arr[0]].name, diffArtists[arr[1]].name, diffArtists[arr[2]].name])
}

