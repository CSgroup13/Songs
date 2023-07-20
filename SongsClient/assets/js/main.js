
const baseApi = 'https://proj.ruppin.ac.il/cgroup13/test2/tar1/api';
// const localhostApi = 'https://localhost:7091/api';

// default error cb for any function if failed
function errorCB(error) {
    let message = error.responseText;
    if (message === undefined || message == "Error in DB") window.location.href = "404.html"
    else {
        Swal.fire({
            icon: 'error',
            text: message,
            color: 'white',
            background: '#171717'
        })
    }
}
$(document).ready(() => {

    //generate 3 random songs on the load of the page
    ajaxCall("GET", baseApi + `/Songs/randomSong`, "", successCBRandom, errorCB);
    ///Artists////


    //flag to know if we want to render favorite artists again(if user is on favorite artist)
    let removeFromFavPage = false;
    //renders all artists 
    $("#showAllArtistsBtn").click(function () {
        removeFromFavPage = false;
        $("#searchArtistInput").val("");
        renderArtists();
    })
    //pull from DB user favorite artists
    $("#showFavoritesArtists").click(function () {
        removeFromFavPage = true;
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
    //search an artist my name
    $("#searchArtistBtn").click(() => {
        let inputName = $("#searchArtistInput").val();
        if (inputName === "") {
            Swal.fire({
                icon: 'error',
                text: "Please Enter Input To Search",
                color: 'white',
                background: '#171717'
            })
        }
        else {
            removeFromFavPage = false;
            ajaxCall("GET", baseApi + `/Artists/byName/${inputName}/info`, "", function (data) {
                const artistsDiv = document.getElementById("artists");
                artistsDiv.innerHTML = "";
                if (data.length > 0) {
                    addArtistsToDiv(data);
                }
                else {
                    artistsDiv.innerHTML = "<p>Artist Not Found.</p>";
                }
            }, errorCB);
        }
        return false;
    })
    renderArtists();
    // get all artists data from DB
    function renderArtists() {
        ajaxCall("GET", baseApi + `/Artists`, "", successCBAllArtists, errorCB);
    }
    //when clicking on the back of an artist card
    //this function pulls info on specific artist from DB and LastFM API then preparing a swal with artist likes,songs and comments functionality
    $(document).on("click", ".back", function (event) {
        event.preventDefault();
        const name = $(event.target).closest(".artist").find("h4").text();
        let currArtist;
        $.ajax({
            async: false,
            type: "GET",
            url: `${baseApi}/Artists/byName/${name}/info`,
            data: "",
            cache: false,
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                currArtist = data[0];
            },
            error: errorCB
        });
        let lastFmApi = lastfmBaseAPi + "/?method=artist.getinfo&artist=" + currArtist.name + "&api_key=" + lastfmKey + "&format=json";
        let summary;
        $.ajax({
            async: false,
            type: "GET",
            url: lastFmApi,
            data: "",
            cache: false,
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                summary = data.artist.bio.summary;
            },
            error: errorCB
        });
        const swal = Swal.fire({
            title: `About ${currArtist.name}`,
            html: `<div class="song-popup">${summary}</div><i id="artistHeart_${currArtist.id}" class="fa fa-heart-o addToFavorite" title="Add To Favorite" style="color:white;"></i><p id="removeFromFav_${currArtist.id}" class="removeArtistFromFav title="Remove From Favorite">&#x1F494;</p><br><a class="songsDetails" id="${currArtist.id}_songsDetails">click here for songs of ${currArtist.name}</a>`,
            color: 'white',
            background: '#171717',
            confirmButtonText: "Close",
        });
        $(`#${currArtist.id}_songsDetails`).click(() => {
            event.preventDefault();
            let songsList = [];
            $.ajax({ //get artist songs list
                async: false,
                type: "GET",
                url: baseApi + `/Artists/${currArtist.name}/songs`,
                data: "",
                cache: false,
                contentType: "application/json",
                dataType: "json",
                success: function (artistSongs) {
                    songsList = artistSongs; //add songsList to artist object
                },
                error: errorCB
            });
            const songsDiv = $("<div>");
            for (let song of songsList) {
                songsDiv.append(`<div id="artistSong_${song.id}" class="songsList"><a>${song.name}</a></div>`);
            }
            swal.update({
                title: `Songs of ${currArtist.name}`,
                html: songsDiv
            });
            for (let song of songsList) {
                $(`#artistSong_${song.id}`).on('click', function () {
                    showSongPopup(song.name)
                })
            }
        })
        $(`#artistHeart_${currArtist.id}`).click(() => {
            if (localStorage.user === undefined) {
                Swal.fire({
                    icon: 'error',
                    text: "Please Log in to add artist to Favorites",
                    color: 'white',
                    background: '#171717'
                })
                return;
            }
            ajaxCall("POST", baseApi + `/Users/${JSON.parse(localStorage.user).id}/addArtistToFav/${currArtist.id}`, "", function (data) {
                Swal.fire({
                    icon: 'success',
                    text: "Artist added to your Favorites",
                    color: 'white',
                    background: '#171717'
                })
                const artistDiv = $(".back").filter(function () {
                    return $(this).find("h4").text() === data.name;
                });
                artistDiv.find("p").last().html(`&#xf004; ${data.rate}`);
            }, errorCB);
        })

        $(`#removeFromFav_${currArtist.id}`).click(() => {
            if (localStorage.user === undefined) {
                Swal.fire({
                    icon: 'error',
                    text: "Please Log in to remove artist from Favorites",
                    color: 'white',
                    background: '#171717'
                })
                return;
            }
            ajaxCall("DELETE", baseApi + `/Users/${JSON.parse(localStorage.user).id}/removeArtistFromFav/${currArtist.id}`, "", function (data) {
                Swal.fire({
                    icon: 'success',
                    text: "Artist removed from your Favorites",
                    color: 'white',
                    background: '#171717'
                })
                const artistDiv = $(".back").filter(function () {
                    return $(this).find("h4").text() === currArtist.name;
                });
                artistDiv.find("p").last().html(`&#xf004; ${data.rate}`);
                if (removeFromFavPage) {
                    $("#showFavoritesArtists").click();
                }
            }, errorCB);
        })
    });

    ////////////////////////login and register///////////////////

    //this function renders login page elements according to page parameter login/logut/signup
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
                Swal.fire({
                    icon: 'success',
                    text: "You Logged Out!",
                    color: 'white',
                    background: '#171717',
                    timer: 3500,
                    showConfirmButton: false,
                    didOpen: () => {
                        const body = JSON.stringify({
                            data: [
                                `Good Bye ${JSON.parse(localStorage["user"]).name}`,
                                "KSP (male)",
                            ]
                        })
                        ajaxCall("POST", "https://matthijs-speecht5-tts-demo.hf.space/run/predict", body, function (data) {
                            const audioRes = `https://matthijs-speecht5-tts-demo.hf.space/file=` + data.data[0].name;
                            var audio = new Audio(audioRes);
                            audio.play();

                        }, errorCB);
                    }
                }).then(() => {
                    localStorage.removeItem("user");
                    updateLoginBtns();
                    window.location.href = "./index.html";
                })
            })
        }
        else if (page === "login") { //login page
            $("#mainFormDiv").append('<h2 id="formHeader2">Log in to enjoy your music</h2><form id="loginForm" class="work-request"><div id="formDiv" class="work-request--information"><div class="information-email"><input id="logEmailInp" type="email" spellcheck="false" placeHolder="Email" title="example12@example.exapmle" required></div><div class="information-name"><input id="logPassInp" type="password" spellcheck="false" placeholder="Password" title="password must has a minimum of 6 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number, with no spaces." required></div></div><input type="submit" value="Log In"></form><div id="loginSignUp"><span class="notMember">Not a Member? </span><button class="signUpLink cta notMember"><u>Sign Up Now</u></button></div>');
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
                ajaxCall("POST", baseApi + "/Users/login", JSON.stringify(User), function (data) {
                    successCBLogin(data, "Logged in")
                }, errorCB);
                return false;
            })
        }
        else { //signup page
            $("#mainFormDiv").append('<h2 id="formHeader3">Sign up to enjoy new music</h2><form id="signUpForm" class="work-request"><div id="formDiv" class="work-request--information"><div class="information-name"><input id="regNameInp" type="text" spellcheck="false" placeholder="Name" title="name must include only letters" required ></div><div class="information-email"><input id="regEmailInp" type="email" spellcheck="false" placeholder="Email" title="example12@example.exapmle" required></div><div class="information-name"><input id="regPassInp" type="password" spellcheck="false" placeholder="Password" title="password should has a minimum of 6 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number, with no spaces." required></div></div><input type="submit" value="Sign Up"></form><div id="signUpLogin"><span class="notMember">Already a Member? </span><button class="loginSignUp cta notMember"><u>Login Now</u></button></div>');
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
                ajaxCall("POST", baseApi + "/Users/register", JSON.stringify(User), function (data) {
                    successCBLogin(data, "Signed Up")
                }, errorCB);
                return false;
            })
        }
    }
    //this function updates website buttons to match current state: user is logged in / no user is logged in (guest)
    let updateLoginBtns = () => {
        if (localStorage["user"] != undefined) { //user logged in
            $(".header--cta").html("Hello " + JSON.parse(localStorage["user"]).name);
            $("#loginLink").html('LOGOUT <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 150 118" style="enable-background:new 0 0 150 118;" xml:space="preserve"><g transform="translate(0.000000,118.000000) scale(0.100000,-0.100000)"><path d="M870,1167c-34-17-55-57-46-90c3-15,81-100,194-211l187-185l-565-1c-431,0-571-3-590-13c-55-28-64-94-18-137c21-20,33-20,597-20h575l-192-193C800,103,794,94,849,39c20-20,39-29,61-29c28,0,63,30,298,262c147,144,272,271,279,282c30,51,23,60-219,304C947,1180,926,1196,870,1167z" /></g></svg><span class="btn-background"></span>');
            $('.notMember').hide();
            $('.signUpLink').hide();
            $('.side-nav li:nth-child(7)').addClass('logout');
            $("#outBarLogin").html("Logout");
            updateLoginPage("logout");
        }
        else { //guest
            $(".header--cta").html("Hello Guest");
            $("#loginLink").html('Login <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 150 118" style="enable-background:new 0 0 150 118;" xml:space="preserve"><g transform="translate(0.000000,118.000000) scale(0.100000,-0.100000)"><path d="M870,1167c-34-17-55-57-46-90c3-15,81-100,194-211l187-185l-565-1c-431,0-571-3-590-13c-55-28-64-94-18-137c21-20,33-20,597-20h575l-192-193C800,103,794,94,849,39c20-20,39-29,61-29c28,0,63,30,298,262c147,144,272,271,279,282c30,51,23,60-219,304C947,1180,926,1196,870,1167z" /></g></svg><span class="btn-background"></span>');
            $('.notMember').show();
            $('.signUpLink').show();
            $('.side-nav li:nth-child(7)').removeClass('logout');
            $("#outBarLogin").html("Login");
            updateLoginPage("login");
        }
    }
    //initialize page to guest state
    updateLoginBtns();
    updateLoginPage("login");
    // clicking on sign up button renders sign up form
    $(document).on('click', '.signUpLink', function () {
        updateLoginPage("signup");
    });
    // clicking on login button renders log in form
    $(document).on('click', '.loginSignUp', function () {
        updateLoginPage("login");
    });
    //clicking on login/out left side nav bar renders page elements according to state
    $('#loginLi').click(function () {
        if (localStorage["user"] != undefined) { //user logged in
            updateLoginPage("logout");
        }
        else {
            updateLoginPage("login");
        }
    });
    //same as last function but user clicked from outer nav (right side)
    $('#outBarLogin').click(function () {
        if (localStorage["user"] != undefined) { //user logged in
            updateLoginPage("logout");
        }
        else {
            updateLoginPage("login");
        }
    });
    //clicking on login/out button renders page elements according to state. if user is logged in logs him out and play goodbye greeting
    $('#loginLink').click(function () {
        if (localStorage["user"] != undefined) { //user want to logOut
            Swal.fire({
                icon: 'success',
                text: "You Logged Out!",
                color: 'white',
                background: '#171717',
                timer: 3500,
                showConfirmButton: false,
                didOpen: () => {
                    const body = JSON.stringify({
                        data: [
                            `Good Bye ${JSON.parse(localStorage["user"]).name}`,
                            "KSP (male)",
                        ]
                    })
                    ajaxCall("POST", "https://matthijs-speecht5-tts-demo.hf.space/run/predict", body, function (data) {
                        const audioRes = `https://matthijs-speecht5-tts-demo.hf.space/file=` + data.data[0].name;
                        var audio = new Audio(audioRes);
                        audio.play();

                    }, errorCB);
                }
            }).then(() => {
                localStorage.removeItem("user");
                window.location.href = "./index.html";
            })
        }
        else { //user want to login
            updateLoginPage("login");
        }
    });

    //user successfully logged in/signed up - plays hello greeting and refresh page
    function successCBLogin(data, type) {
        localStorage["user"] = JSON.stringify(data);
        Swal.fire({
            icon: 'success',
            text: `You ${type} Successfully!`,
            color: 'white',
            background: '#171717',
            timer: 3500,
            showConfirmButton: false,
            didOpen: () => {
                const body = JSON.stringify({
                    data: [
                        `hello ${data.name}`,
                        "KSP (male)",
                    ]
                })
                ajaxCall("POST", "https://matthijs-speecht5-tts-demo.hf.space/run/predict", body, function (data) {
                    const audioRes = `https://matthijs-speecht5-tts-demo.hf.space/file=` + data.data[0].name;
                    var audio = new Audio(audioRes);
                    audio.play();

                }, errorCB);
            }
        }).then(() => {
            window.location.href = "./index.html";
        })
    }


    /////QUIZ/////
    //in charge of wrong answer sound in quiz
    function playWrongAnswerSound() {
        var audio = new Audio("./assets/audio/fail-144746.mp3");
        audio.play();
    }

    //in charge of correct answer sound in quiz
    function playCorrectAnswerSound() {
        var audio = new Audio("./assets/audio/correct-6033.mp3");
        audio.play();
    }

    //in charge of start quiz sound
    function playStartQuizAudio() {
        var audio = new Audio("./assets/audio/lets-start-the-quiz-b-39670.mp3");
        audio.play();
    }

    //in charge of end quiz sound
    function playEndQuizAudio() {
        var audio = new Audio("./assets/audio/electric-chimes-87900.mp3");
        audio.play();
    }
    //resets score to zero
    let score = 0;
    //this function gets question function runs it and renders returned array to quiz while shuffeling answers
    //also this function in charge for 30 seconds timer of question.
    function renderQuestion(q) {
        let qArr = q();
        let answersArr = [` <div id="q_1" class="answerDiv ">
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
            $('.answerDiv').css("pointer-events", "none");
            playCorrectAnswerSound();
            clearInterval(interval);
            $(this).css("border", "2px solid green");
            sumAnswer('Correct');
        });
        $('.wrongAns').on("click", function () {
            $('.answerDiv').css("pointer-events", "none");
            playWrongAnswerSound();
            clearInterval(interval);
            $(this).css("border", "2px solid red");
            $('#q_1').css("border", "2px solid green");
            sumAnswer('Wrong');
        });
        const timerElement = document.getElementById('timer');
        let timeLeft = 30;
        timerElement.textContent = timeLeft;
        interval = setInterval(() => {
            timeLeft--;
            if ($(".quizNav.is-active").length === 0) {
                resetQuiz();
                return;
            }
            timerElement.textContent = timeLeft;
            if (timeLeft === 0) {
                clearInterval(interval);
                var audio = new Audio("./assets/audio/buzzer-or-wrong-answer-20582.mp3");
                audio.play();
                timerElement.textContent = 'Time up!';
                $('.wrongAns').css("border", "2px solid red");
                $('#q_1').css("border", "2px solid green");
                setTimeout(() => manageQuiz(), 2000);
            }
        }, 1000);

    }
    //this function sums score if correct and continue the quiz next question
    function sumAnswer(answer) {
        if (answer === "Correct")
            score += 10;
        setTimeout(() => manageQuiz(), 2000);
    }
    //declaring global variables for quiz mangment
    let interval;
    let currentQuestionIndex = 0;
    let questArr = [getQ1, getQ2, getQ3, getQ4, getQ1, getQ5, getQ6, getQ7, getQ2, getQ8]
    let questionsQueue = Array.from(questArr);
    //reseting neccessary variables for the next quiz
    function resetQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        questionsQueue = Array.from(questArr)
        clearInterval(interval);
    }

    //this function in charge for starting quiz and managing questions queue, calling renderQuestion func for each question template in a shuffeld manner
    function manageQuiz() {
        if (questionsQueue.length === 0) {
            playEndQuizAudio();
            $("#Quiz").html(`<div id="QuizoverDiv" class="about--banner"><h2 id="quizHeader">QUIZ OVER!</h2><h3 id="scoreOver">Your Score: ${score}</h3></div>`);
            $("#Quiz").append(`<button id="playAgain">Play Again</button>`);
            $("#Quiz").append(`<button id="leaderBoard">Leaders Board</button>`);
            $("#Quiz").append(`<div><img id="winnerImg" src="assets/img/winnerCup.png"></img></div>`);
            $("#playAgain").on('click', () => {
                playStartQuizAudio();
                manageQuiz();
            });
            $("#leaderBoard").on('click', () => {
                var audio = new Audio("./assets/audio/success-fanfare-trumpets-6185.mp3");
                audio.play();
                ajaxCall("GET", `${baseApi}/Users/leaders`, "", showLeadersboard, errorCB);
            });
            let userId = JSON.parse(localStorage["user"]).id;
            ajaxCall("POST", `${baseApi}/Users/${userId}/Score/${score}`, "", function (data) {
                $("#scoreOver").append(`<br><span id="totalScore">Total Score: ${data.score}</span>`)
            }, errorCB);
            resetQuiz();
            return;
        }
        let rand = Math.floor(Math.random() * questionsQueue.length)
        renderQuestion(questionsQueue[rand]);
        questionsQueue.splice(rand, 1);
    }
    $(".quizNav").click(() => {
        resetQuiz();
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
                questionsQueue = Array.from(questArr);
                playStartQuizAudio();
                manageQuiz();
            });
        } else {
            quizDiv.html(`<h1>You Must Login For Starting Quiz!</h1>`);
        }
    }

});
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
const lastfmBaseAPi = "https://ws.audioscrobbler.com/2.0";
const lastfmKey = "d6293ebc904c9f3e71bf638f0b55a5f6";

function successCBAllArtists(data) {
    const artistsDiv = document.getElementById("artists");
    artistsDiv.innerHTML = "";
    let count = data.length;
    if (count > 0) {
        addArtistsToDiv(data);
    }
    else {
        artistsDiv.innerHTML = "<p>Artist Not Found.</p>";
    }
}

function addArtistsToDiv(artists) {
    const artistsDiv = document.getElementById("artists");
    $("#artistLoader").hide();
    for (let artist of artists) {
        let lastFmApi = lastfmBaseAPi + "/?method=artist.getinfo&artist=" + artist.name + "&api_key=" + lastfmKey + "&format=json";
        ajaxCall("GET", lastFmApi, "", function (data) {
            $(".back").each(function () {
                if ($(this).find("h4").text() === artist.name) {
                    const listeners = data.artist.stats.listeners;
                    const playcount = data.artist.stats.playcount;
                    const listenersElement = $("<p>").text("listeners: " + listeners);
                    const playcountElement = $("<p>").text("playcount: " + playcount);
                    const rateElement = $("<p class='fa'>").html("&#xf004; " + artist.rate);
                    $(this).find("#lastFmDetails").html("");
                    $(this).find("#lastFmDetails").append(listenersElement, playcountElement, rateElement);
                }
            });
        }, errorCB);
        artistsDiv.innerHTML += `<div class="artist">
                     <div class="front">
                     <img src=${artist.image}>
                 </div>
                 <div id=artist_${artist.id} class="back">
                     <h4>${artist.name}</h4>
                     <div id="lastFmDetails"></div>
                 </div>
                 </div>`;
    }
}
//////////Quiz/////////////
const start = 0;
const end = 50;

//this function returns random artist object
function randomArtist() {
    let randArtist;
    $.ajax({
        async: false,
        type: "GET",
        url: baseApi + `/Artists/randomArtist`,
        data: "",
        cache: false,
        contentType: "application/json",
        dataType: "json",
        success: function (data) {
            randArtist = data
        },
        error: errorCB
    });
    return randArtist;
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
    $.ajax({
        async: false,
        type: "GET",
        url: baseApi + `/Songs/getSongByDiffArtist/${artistName}`,
        data: "",
        cache: false,
        contentType: "application/json",
        dataType: "json",
        success: function (data) {
            song = data;
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
        let sentence = "“" + song.lyrics.substring(start, end) + "..”";
        sentences.push(sentence);
    }
    return sentences;
}
//get sentence from given artist song
function getSongsSentenceOFDifferentArtist(artistName) {
    const song = getRandomSongOfDifferentArtist(artistName);
    let sentence = "“" + song.lyrics.substring(start, end) + "..”";

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

//return random song
function getRandomSong() {
    let songs;
    $.ajax({
        async: false,
        type: "GET",
        url: baseApi + `/Songs/randomSong`,
        data: "",
        cache: false,
        contentType: "application/json",
        dataType: "json",
        success: function (data) {
            songs = data;
        },
        error: errorCB
    });
    return songs[0];
}

function getQ1() {
    let preview = null;
    let q1 = [];
    let song;
    do {
        song = getRandomSong();
        $.ajax({
            async: false,
            type: "GET",
            url: baseApi + `/Songs/${song.name}/info`,
            data: "",
            cache: false,
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                preview = data.songPreview;
            },
            error: errorCB
        });
    } while (preview == null)
    q1.push(`Which singer sings the following song? (play the audio) <br>
    <audio id="audioPlayer" controls> <source src="${preview}" type="audio/mpeg">
        Your browser does not support the audio element.
    </audio>`);
    q1.push(song.artistName);
    q1.push(...generateDiff3Artists(song.artistName));

    return q1;
}
function getQ2() {
    let q2 = [];
    let artist;
    let artistName;
    do {
        artist = randomArtist()
        artistName = artist.name;
    } while (artistName == "Beauty And The Beast" || artistName == "Divine")
    const question = "Who is this artist?" + `<br><img src="${artist.image}" id="quiz_image">`;
    q2.push(question, artistName);
    q2.push(...generateDiff3Artists(artistName));


    return q2;
}
function getQ3() {
    let q3 = [];
    const artistName = randomArtist().name;
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
            q5Arr.push(`Who sang: “${songLyrics}.. ” ?`, songArtist)
            q5Arr.push(...generateDiff3Artists(songArtist))
        },
        error: errorCB
    });
    return q5Arr;
}

function getQ6() {
    let q6 = [];
    const artistName = randomArtist().name;
    const question = "Which of the following sentences is not part of " + artistName + "'s song?";
    q6.push(question);
    q6.push(getSongsSentenceOFDifferentArtist(artistName));
    q6.push(...getSongsSentences(artistName));

    return q6;
}

function getQ7() {
    let q7 = [];
    const artistName = randomArtist().name;
    const song = getArtistSongs(artistName)[0];//random song
    const sentence = song.lyrics.substring(start, end);
    const question = `From which song is the following sentence taken? <br> ${sentence}`;
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
            const songLyrics = "“" + songs[randInt].lyrics.substring(start, end);
            const songArtist = songs[randInt].artistName
            q6Arr.push(`Which one of the lyrics is from: ${songName} ?`, songLyrics + "..”")
            let diffArtist = []
            diffArtist.push(...generateDiff3Artists(songArtist))
            for (let i = 0; i < 3; i++) {
                let lyrics = getArtistSongs(diffArtist[i])[0].lyrics.substring(start, end)
                q6Arr.push("“" + lyrics + "..”")
            }
        },
        error: errorCB
    });
    return q6Arr;
}




$(document).ready(() => {
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
        if (this.checked)
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
    recognization.lang = 'en-US';
    recognization.onstart = () => {
        output.val("");
    }
    recognization.onresult = (e) => {
        var transcript = e.results[0][0].transcript;
        output.val(transcript);
        $("#searchBtn").click();
    }
    recognization.start();
}

function successCBSong(data) {
    $("#songs").html("");
    if (data.length === undefined) {//single song returned as object and not array
        $("#songs").append(`
                  <div class="work--lockup songsGallery">
                    <ul class="slider">
                      <li class="slider--item slider--item-center" id="slideSong_${data.id}">
                        <a>
                          <div class="slider--item-image">
                            <img src="${data.image}" alt="Metiew and Smith">
                          </div>
                          <p class="slider--item-title">${data.name}</p>
                          <p class="slider--item-description">${data.artistName}</p>
                        </a>
                      </li>
                    </ul>
                  </div>`)
        $(`#slideSong_${data.id}`).click(function () {
            showSongPopup(data.name);
        });
    }
    else {
        $("#songs").append(`
           <div class="work--lockup songsGallery">
            <ul class="slider"> </ul>
              </div>`)
        $("div.work--lockup>ul.slider").append(`
    <li class="slider--item slider--item-${data.length === 1 ? "center" : "left"}" id="slideSong_${data[0].id}">
        <a>
            <div class="slider--item-image">
                <img src="${data[0].image}" alt="Victory">
            </div>
            <p class="slider--item-title">${data[0].name}</p>
            <p class="slider--item-description">${data[0].artistName}</p>
        </a>
    </li>`)
        $(`#slideSong_${data[0].id}`).click(function () {
            showSongPopup(data[0].name);
        });
        if (data.length > 1) {
            $("div.work--lockup>ul.slider").append(`<li class="slider--item slider--item-center" id="slideSong_${data[1].id}">
            <a>
              <div class="slider--item-image">
                <img src="${data[1].image}" alt="Metiew and Smith">
              </div>
             <p class="slider--item-title">${data[1].name}</p>
             <p class="slider--item-description">${data[1].artistName}</p>
            </a>
          </li>`)
            $(`#slideSong_${data[1].id}`).click(function () {
                showSongPopup(data[1].name);
            });
        }
        if (data.length > 2) {
            $("div.work--lockup>ul.slider").append(`<li class="slider--item slider--item-right" id="slideSong_${data[2].id}">
          <a>
            <div class="slider--item-image">
              <img src="${data[2].image}" alt="Alex Nowak">
            </div>
            <p class="slider--item-title">${data[2].name}</p>
            <p class="slider--item-description">${data[2].artistName}</p>
            </a>
            </li>`)
            $(`#slideSong_${data[2].id}`).click(function () {
                showSongPopup(data[2].name);
            });
        }
        for (let i = 3; i < data.length; i++) {
            $("div.work--lockup>ul.slider").append(`<li class="slider--item" id="slideSong_${data[i].id}">
          <a>
            <div class="slider--item-image">
              <img src="${data[i].image}" alt="Alex Nowak">
            </div>
            <p class="slider--item-title">${data[i].name}</p>
            <p class="slider--item-description">${data[i].artistName}</p>
          </a>
             </li> `)
            $(`#slideSong_${data[i].id}`).click(function () {
                showSongPopup(data[i].name);
            });
        }
        if (data.length > 1) {
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
function showSongPopup(songName) {
    ajaxCall("GET", baseApi + `/Songs/${songName}/info`, "", successCBSongLyrics, errorCB);
}

function successCBSongLyrics(data) {
    let swal = Swal.fire({
        title: `${data.name}`,
        html: `<div class="song-popup">${data.lyrics.replace(/\n/g, '<br>')}</div>
                       <br>
                       <i id="song_${data.id}" class="fa fa-heart-o addToFavorite" title="Add To Favorite" style="color:white;"></i><span> ${data.rate}</span>
                       <img src="./assets/img/comment.png" id="comments_${data.id}" class="commentImage" title="show comments"></img>
                       <br>
                       <audio id="audioPlayer" controls>
                            <source src="${data.songPreview}" type="audio/mpeg">
                            Your browser does not support the audio element.
                        </audio>
                        <a id="youtubeLink" target="_blank" class="youtube-link" title="Go To Youtube"><img id="youtubeImg" src="./assets/img/youtubeLogo.png" alt="YouTube Logo"></a>`, //${htmlLink}
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
            $(`#comments_${data.id}`).click(() => {
                if (localStorage.user === undefined) {
                    swal.update({
                        icon: 'error',
                        title: "You should login to view comments",
                        html: ""
                    })
                }
                else {
                    //add comment form
                    let newCommentForm = `<form class="commentForm" id="addCommentForm_${data.id}">
                <label for="comment">Add new comment:</label><br>
                <textarea id="comment_${data.id}" class="new_comment" name="message" rows="2" cols="20" required></textarea><br>
                <input type="submit" value="Submit">
            </form>`;

                    //all song comments
                    let commentsDiv = getSongCommentsDiv(data, swal);
                    swal.update({
                        title: "Comments",
                        html: newCommentForm + commentsDiv
                    })

                    $(document).off('submit', `#addCommentForm_${data.id}`);
                    $(document).on('submit', `#addCommentForm_${data.id}`, (event) => {//add new comment
                        event.preventDefault()
                        let commentForSong = $(`#comment_${data.id}`).val();
                        ajaxCall("POST", `${baseApi}/Songs/addComment/${data.id}/${JSON.parse(localStorage.user).id}`, JSON.stringify(commentForSong), function (responseData) {
                            commentsDiv = getUpdateCommentsDiv(responseData, swal);
                            swal.update({
                                title: "Comments",
                                html: newCommentForm + commentsDiv
                            })
                        }, errorCB);
                    })
                }

            })
            $("#youtubeLink").click(() => {
                generateYouTubeLink(data.name, data.artistName)
                    .then((link) => {
                        window.open(link);
                    })
                    .catch(error => {
                        errorCB(error)
                    })
            });
        }
    });
}
function getUpdateCommentsDiv(data, swal) {//data is array of updated song comments
    let commentsDiv = $('<div id="comments-container">');
    let newCommentForm;
    if (data.length === 0) {
        commentsDiv.html("This songs doesn't have comments.")
    }
    else {
        newCommentForm = `<form id="addCommentForm_${data[0].songId}" class="commentForm">
        <label for="comment">Add new comment:</label><br>
        <textarea id="comment_${data[0].songId}" class="new_comment" name="message" rows="2" cols="20" required></textarea><br>
        <input type="submit" value="Submit">
        </form>`;
        for (let c of data) {
            if (c.userId === JSON.parse(localStorage.user).id) {
                commentsDiv.append(`<div class="comment"><span>${c.comment} - by ${c.userName} </span><i class="commentDel_${c.id} fa deleteComment" style="font-size:24px" title="delete comment"> &#xf00d;</i></div>`);
                $(document).off('click', `.commentDel_${c.id}`);
                $(document).on('click', `.commentDel_${c.id}`, () => {//delete comment
                    ajaxCall("DELETE", `${baseApi}/Songs/deleteComment/${data[0].songId}/${c.id}`, "", function (responseData) {
                        let updateDiv = getUpdateCommentsDiv(responseData, swal);
                        swal.update({
                            title: "Comments",
                            html: newCommentForm + updateDiv
                        })
                    }, errorCB);
                })
            }
            else {
                commentsDiv.append(`<div class="comment"><span>${c.comment} - by ${c.userName}</span></div>`);
            }
        }
    }
    return commentsDiv.prop('outerHTML');
}

function getSongCommentsDiv(data, swal) {//data is song object
    let songsComments = [];
    $.ajax({
        async: false,
        type: "GET",
        url: baseApi + `/Songs/comments/${data.id}`,
        data: "",
        cache: false,
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
            songsComments = response;
        },
        error: errorCB
    });
    let commentsDiv = $('<div id="comments-container">');
    let newCommentForm = `<form id="addCommentForm_${data.id}" class="commentForm">
                <label for="comment">Add new comment:</label><br>
                <textarea id="comment_${data.id}" class="new_comment" name="message" rows="2" cols="20" required></textarea><br>
                <input type="submit" value="Submit">
            </form>`;

    if (songsComments.length === 0) {
        commentsDiv.html("This songs doesn't have comments.")
    }
    else {
        for (let c of songsComments) {
            if (c.userId === JSON.parse(localStorage.user).id) {
                commentsDiv.append(`<div class="comment"><span>${c.comment} - by ${c.userName} </span><i id="commentDel_${c.id}" class="fa deleteComment" style="font-size:24px" title="delete comment"> &#xf00d;</i></div>`);
                $(document).off('click', `#commentDel_${c.id}`);
                $(document).on('click', `#commentDel_${c.id}`, function () {//delete comment
                    let commentId = c.id;
                    ajaxCall("DELETE", `${baseApi}/Songs/deleteComment/${data.id}/${commentId}`, "", function (responseData) {
                        let updateDiv = getUpdateCommentsDiv(responseData, swal);
                        swal.update({
                            title: "Comments",
                            html: newCommentForm + updateDiv
                        });
                    }, errorCB);
                });

            }
            else {
                commentsDiv.append(`<div class="comment"><span>${c.comment} - by ${c.userName}</span></div>`);
            }
        }
    }
    return commentsDiv.prop('outerHTML');
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


///////////QUIZ/////////

//generates 3 different artist other than given songArtist
function generateDiff3Artists(songArtist) {
    let diffArtists = [];
    $.ajax({
        async: false,
        type: "GET",
        url: baseApi + `/Artists/diffRandomArtists/${songArtist}`,
        data: "",
        cache: false,
        contentType: "application/json",
        dataType: "json",
        success: function (data) {
            for (const artist of data) {
                diffArtists.push(artist.name)
            }
        },
        error: errorCB
    });
    return diffArtists;
}

$(document).ready(function () {
    $(".artiststBtns").on("click", function () {
        $(".artiststBtns").removeClass("active");
        $(this).addClass("active");
    });
});

async function generateYouTubeLink(songName, artistName) {
    const apiKey = 'AIzaSyC2W6ggVmVdSWAioEd8oZnhbHCh-hJTwJM';
    const formattedSongName = encodeURIComponent(songName);
    const formattedArtistName = encodeURIComponent(artistName);
    const songNameSearch = songName.replace(/\s/g, '+');
    const artistNaeSearch = artistName.replace(/\s/g, '+');

    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${formattedSongName} ${formattedArtistName}&key=${apiKey}`;
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${songNameSearch} ${artistNaeSearch}`

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        // Retrieve the video ID of the first search result
        const videoId = data.items[0].id.videoId;

        // Construct the YouTube video URL
        const youtubeVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const htmlLink = youtubeVideoUrl

        // Return the HTML link
        return htmlLink;
    } catch (error) {
        return youtubeSearchUrl;
    }
}