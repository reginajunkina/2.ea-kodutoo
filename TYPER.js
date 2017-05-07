var canvas = 0;
var audioClip = new Audio();
var audioFile = "";
var startTime;
var showPos = 0;

var TYPER = function () {

    //singleton
    if (TYPER.instance_) {
        return TYPER.instance_;
    }
    TYPER.instance_ = this;

    // Muutujad
    this.WIDTH = window.innerWidth;
    this.HEIGHT = window.innerHeight;
    this.canvas = null;
    this.ctx = null;

	
    this.words = []; // kõik sõnad
    this.word = null; // preagu arvamisel olev sõna
    this.word_min_length = 3;
    this.guessed_words = 0; // arvatud sõnade arv
	this.timeLimit = 20;
	this.gameOver = true;
    
    this.init();
};

TYPER.prototype = {

    // Funktsioon, mille käivitame alguses
    init: function () {

        // Lisame canvas elemendi ja contexti
        this.canvas = document.getElementsByTagName('canvas')[0];
        this.ctx = this.canvas.getContext('2d');

        // canvase laius ja kõrgus veebisirvija akna suuruseks (nii style, kui reso)
        this.canvas.style.width = this.WIDTH + 'px';
        this.canvas.style.height = this.HEIGHT + 'px';

        //resolutsioon
        // kui retina ekraan, siis võib ja peaks olema 2 korda suurem
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;

        // laeme sõnad
        this.loadWords();
		
		// küsime mängija andmed
        this.loadPlayerData();
    },

    loadPlayerData: function(){

		// küsime mängija nime ja muudame objektis nime
		var p_name = prompt("Sisesta mängija nimi");

		// Kui ei kirjutanud nime või jättis tühjaks
		if(p_name === null || p_name === ""){
			p_name = "Tundmatu";		
		}
		
		this.player = {name: p_name, score: 0, Id: parseInt(1000+Math.random()*999999)};
		this.playerArray=JSON.parse(localStorage.getItem('player'));
		
		if(!this.playerArray || this.playerArray.length===0){
			this.playerArray=[];
		}
		
		this.playerArray.push(this.player);
		console.log("lisatud");
		
		localStorage.setItem("player", JSON.stringify(this.playerArray));
		

		// Mänigja objektis muudame nime
		this.player.name = p_name; // player =>>> {name:"Romil", score: 0}
        console.log(this.player);
	},

    loadWords: function () {

        console.log('loading...');

        // AJAX http://www.w3schools.com/ajax/tryit.asp?filename=tryajax_first
        var xmlhttp = new XMLHttpRequest();

        // määran mis juhtub, kui saab vastuse
        xmlhttp.onreadystatechange = function () {

            //console.log(xmlhttp.readyState); //võib teoorias kõiki staatuseid eraldi käsitleda

            // Sai faili tervenisti kätte
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

                console.log('successfully loaded');

                // serveri vastuse sisu
                var response = xmlhttp.responseText;
                //console.log(response);

                // tekitame massiivi, faili sisu aluseks, uue sõna algust märgib reavahetuse \n
                var words_from_file = response.split('\n');
                //console.log(words_from_file);

                // Kuna this viitab siin xmlhttp päringule siis tuleb läheneda läbi avaliku muutuja
                // ehk this.words asemel tuleb kasutada typerGame.words

                //asendan massiivi
                typerGame.words = structureArrayByWordLength(words_from_file);
                console.log(typerGame.words);
				
				

            }
        };

        xmlhttp.open('GET', './lemmad2013.txt', true);
        xmlhttp.send();
    },

    start: function () {

        // Tekitame sõna objekti Word
        this.generateWord();
        //console.log(this.word);
		this.gameStop = parseInt(new Date().getTime() / 1000 + this.timeLimit);
        this.drawAll();
        // Kuulame klahvivajutusi
        window.addEventListener('keypress', this.keyPressed.bind(this));
    },
	
	restart: function () {
		 var retry = confirm("Your score is: " + this.player.score + "\nRetry?");
                    if (retry) {
                        console.log(this.guessed_words);
                        this.guessed_words = 0;
                        this.player.score = 0;

                       // this.saveScore();

                        this.generateWord();
                      //  this.drawAll();
                        this.gameStop = parseInt(new Date().getTime() / 1000 + this.timeLimit);

                        console.log(this.player.score);
                    } 
					location.reload(true);
					$("#SplashScreen").show();
					$("#typer").hide();
	},

    drawAll: function () {

        requestAnimFrame(window.typerGame.drawAll.bind(window.typerGame));

        //console.log('joonistab');
        //joonista sõna
        this.word.Draw();
		var currentTime = parseInt(new Date().getTime() / 1000);
        var timeLeft = this.gameStop - currentTime;
		
		document.getElementById("timer").style.color = 'white'; 
        document.getElementById("timer").innerHTML = "Time: " + timeLeft; 
		
		
		var player_score = this.player.score;
		document.getElementById("player_score").style.color = 'white';
		document.getElementById("player_score").innerHTML = "Score: " + player_score;
		
		if (timeLeft <= 0 && !this.gameOver) {
			this.saveScore();
			this.restart();
			this.gameOver = true;
		}
    },

    generateWord: function () {

        // kui pikk peab sõna tulema, + min pikkus + äraarvatud sõnade arvul jääk 5 jagamisel
        // iga viie sõna tagant suureneb sõna pikkus ühe võrra
        var generated_word_length = this.word_min_length + parseInt(this.guessed_words / 5);

        // Saan suvalise arvu vahemikus 0 - (massiivi pikkus -1)
        var random_index = (Math.random() * (this.words[generated_word_length].length - 1)).toFixed();

        // random sõna, mille salvestame siia algseks
        var word = this.words[generated_word_length][random_index];

        // Word on defineeritud eraldi Word.js failis
        this.word = new Word(word, this.canvas, this.ctx);
    },
	
	
	saveScore: function() {

        //this.playerNameArray = JSON.parse(localStorage.getItem('playerName'));
        //gamesFromStorage = JSON.parse(localStorage.getItem("games"));

        this.playerArray.forEach(function (player, key) {
            //gamesFromStorage.forEach(function(game, key){

            console.log(player);
            console.log(typerGame.player);

            if (player.Id == typerGame.player.Id) {

                player.score = typerGame.player.score;

                console.log("updated");
                console.log(player);

            }

        });
		localStorage.setItem("player", JSON.stringify(this.playerArray));
    },

    keyPressed: function (event) {
		
		
        //console.log(event);
        // event.which annab koodi ja fromcharcode tagastab tähe
        var letter = String.fromCharCode(event.which);
        //console.log(letter);

        // Võrdlen kas meie kirjutatud täht on sama mis järele jäänud sõna esimene
        //console.log(this.word);
        if (letter === this.word.left.charAt(0)) {
			
            // Võtame ühe tähe maha
            this.word.removeFirstLetter();
			
			} 
			
			else if (letter != this.word.left.charAt(0)) {

                 // blink if wrong letter is pressed
				
                 document.body.style.background = "red";
					
                 window.setTimeout(function () {
				 document.body.style.background = "black";}, 100);	
				  				 
			}
 
            // kas sõna sai otsa, kui jah - loosite uue sõna

            if (this.word.left.length === 0) {
                this.guessed_words += 1;
				 
				 document.body.style.background = "#98FB98";
					
                 window.setTimeout(function () {
				 document.body.style.background = "black";}, 100);	
				
                //update player score
                this.player.score = this.guessed_words;

                //loosin uue sõna
                var currentTime = parseInt(new Date().getTime() / 1000);
                if (currentTime < this.gameStop) {
                    this.generateWord();
                    console.log(this.player.score);
                } else {
					if(!this.gameOver)
					{
						this.gameOver = true;
						this.restart();
					}
                }
            }
            //joonistan uuesti
            this.word.Draw();
        }
    };
	// keypress end
	
// executes results() only once	
var done;
function run_once() {
  if (!done) {
    done = true;
    results();
  }
};

var count = 0;
function results(){
    console.log("results");

    var playerData = JSON.parse(localStorage.getItem("player"));


    playerData.sort(function(a, b) {
        return b.score - a.score;
    });

    playerData.forEach(function (player, key) {
        if(count>=10){
            return;
        }
        document.getElementById("player").innerHTML +="<br>"+(count+1)+") " + player.name+"<a style='right: 50px; color: black;padding-top: 0px'>"+"   " + player.score + " points" + "</a>";
        count+=1;
    });
}



/* HELPERS */
function structureArrayByWordLength(words) {
    // TEEN massiivi ümber, et oleksid jaotatud pikkuse järgi
    // NT this.words[3] on kõik kolmetähelised

    // defineerin ajutise massiivi, kus kõik on õiges jrk
    var temp_array = [];

    // Käime läbi kõik sõnad
    for (var i = 0; i < words.length; i++) {

        var word_length = words[i].length;

        // Kui pole veel seda array'd olemas, tegu esimese just selle pikkusega sõnaga
        if (temp_array[word_length] === undefined) {
            // Teen uue
            temp_array[word_length] = [];
        }

        // Lisan sõna juurde
        temp_array[word_length].push(words[i]);
    }

    return temp_array;
}

var requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame /**/||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.onload = function () {
    var typerGame = new TYPER();
    window.typerGame = typerGame;
	ctrlAudio();
};




function ctrlAudio(){
	var filename = "abc.mp3";

	if(window.HTMLAudioElement){
		try{
			if(audioFile !== filename){
				audioFile = filename;
				audioClip.src = audioFile;
				startTime = new Date();
				showPos = 0;
			}
			if(audioClip.pause){
				audioClip.play();
				document.getElementById("audioCtrlBtn").value = "MUTE";
				document.getElementById("audioCtrlBtn").removeEventListener("click",ctrlAudio);
				document.getElementById("audioCtrlBtn").addEventListener("click",stopAudio);
			}  
		}//try lхppeb
		
		catch(e){
			console.log("Viga: " + e);
		}
	}//if HTMLAudio... lхppeb
}

function stopAudio(){
	
	if(window.HTMLAudioElement){
		try{
			audioClip.pause();
			document.getElementById("audioCtrlBtn").value = "PLAY";
			document.getElementById("audioCtrlBtn").removeEventListener("click",stopAudio);
			document.getElementById("audioCtrlBtn").addEventListener("click",ctrlAudio);
		}//try lхppeb
		
		catch(e){
			console.log("Viga: " + e);
		}
	}//if HTMLAudio... lхppeb
}




