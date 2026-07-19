import { db, ref, set, get, update, onValue } from "./firebase.js";

// =======================
// DOM
// =======================

const status = document.getElementById("status");
const roomInput = document.getElementById("roomCode");

const createBtn = document.getElementById("createRoom");
const joinBtn = document.getElementById("joinRoom");

const game = document.getElementById("game");

const secretInput = document.getElementById("secretNumber");
const submitBtn = document.getElementById("submitNumber");

const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");

const hint = document.getElementById("hint");
const history = document.getElementById("history");

const coinBox = document.getElementById("coinBox");
const coinResult = document.getElementById("coinResult");

const guessBox = document.getElementById("guessBox");

const winner = document.getElementById("winner");
const restartBtn = document.getElementById("restartBtn");


// =======================
// Variables
// =======================

let roomCode = "";
let myPlayer = "";
let roomData = {};


// =======================
// Random Room Code
// =======================

function randomRoom(){

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";

    let code = "";

    for(let i=0;i<6;i++){

        code += chars[Math.floor(Math.random()*chars.length)];

    }

    return code;

}


// =======================
// Create Room
// =======================

createBtn.onclick = async ()=>{

    roomCode = randomRoom();

    myPlayer = "player1";

    await set(ref(db,"rooms/"+roomCode),{

        player1:{
            joined:true,
            ready:false,
            secret:0
        },

        player2:{
            joined:false,
            ready:false,
            secret:0
        },

        turn:"",
        winner:"",
        state:"waiting",
        history:[],
        rematch1:false,
rematch2:false
    });

    roomInput.value = roomCode;

    game.style.display="block";

    status.innerHTML="Room : "+roomCode+"<br>Waiting for Player 2";

    watchRoom();

};


// =======================
// Join Room
// =======================

joinBtn.onclick = async ()=>{

    roomCode = roomInput.value.trim().toUpperCase();

    if(roomCode==""){

        alert("Enter Room Code");

        return;

    }

    const snap = await get(ref(db,"rooms/"+roomCode));

    if(!snap.exists()){

        alert("Room Not Found");

        return;

    }

    myPlayer="player2";

    await update(ref(db,"rooms/"+roomCode+"/player2"),{

        joined:true

    });

    game.style.display="block";

    status.innerHTML="Joined Room";

    watchRoom();

};



// =======================
// Watch Room
// =======================

function watchRoom(){

    onValue(ref(db,"rooms/"+roomCode),(snap)=>{

        if(!snap.exists()) return;

        roomData = snap.val();

        // ===== REMATCH =====
        if(roomData.rematch1 && roomData.rematch2){

            if(myPlayer=="player1"){

                const first=Math.random()<0.5?"player1":"player2";

                update(ref(db,"rooms/"+roomCode),{

                    state:"waiting",
                    winner:"",
                    turn:first,
                    history:[],

                    rematch1:false,
                    rematch2:false

                });

                update(ref(db,"rooms/"+roomCode+"/player1"),{

                    ready:false,
                    secret:0

                });

                update(ref(db,"rooms/"+roomCode+"/player2"),{

                    ready:false,
                    secret:0

                });

            }

            history.innerHTML="";
            hint.innerHTML="";
            winner.innerHTML="";

            secretInput.value="";
            guessInput.value="";

            secretInput.disabled=false;
            submitBtn.disabled=false;

            guessBox.style.display="none";
            coinBox.style.display="none";
            restartBtn.style.display="none";

            status.innerHTML="Choose Secret Number";
        }

        if(roomData.player1.joined && roomData.player2.joined){

            status.innerHTML="Both Players Connected";

        }

        checkReady();
        updateAllUI();

    });

}
// =======================
// Submit Secret Number
// =======================

submitBtn.onclick = async () => {

    const num = Number(secretInput.value);

    if (num < 1 || num > 100) {
        alert("Enter a number between 1 and 100");
        return;
    }

    await update(ref(db, "rooms/" + roomCode + "/" + myPlayer), {
        secret: num,
        ready: true
    });

    secretInput.disabled = true;
    submitBtn.disabled = true;

    status.innerHTML = "Waiting for opponent...";
};


// =======================
// Ready Check
// =======================

function checkReady() {

    if (
        roomData.player1.ready &&
        roomData.player2.ready &&
        roomData.state == "waiting"
    ) {

        if (myPlayer == "player1") {

            const first =
                Math.random() < 0.5 ? "player1" : "player2";

            update(ref(db, "rooms/" + roomCode), {
                state: "playing",
                turn: first
            });

        }

    }

}


// =======================
// Update UI
// =======================

function updateGameUI() {

    if (roomData.state == "playing") {

        coinBox.style.display = "block";
        guessBox.style.display = "block";

        if (roomData.turn == myPlayer) {

            coinResult.innerHTML = "🎉 Your Turn";

            guessInput.disabled = false;
            guessBtn.disabled = false;

        } else {

            coinResult.innerHTML = "⏳ Opponent Turn";

            guessInput.disabled = true;
            guessBtn.disabled = true;

        }

    }

}
// =======================
// Guess System
// =======================

guessBtn.onclick = async () => {

    if (roomData.turn !== myPlayer) {
        alert("It's not your turn!");
        return;
    }

    const guess = Number(guessInput.value);

    if (guess < 1 || guess > 100) {
        alert("Enter a number between 1 and 100");
        return;
    }

    const opponent =
        myPlayer === "player1" ? "player2" : "player1";

    const secret = roomData[opponent].secret;

    let msg = "";

    if (guess === secret) {

        msg = "🎉 Correct!";
        winner.innerHTML = "🏆 You Win!";

        await update(ref(db, "rooms/" + roomCode), {
            winner: myPlayer
        });

    } else if (guess > secret) {

        msg = "⬇ LOWER";

    } else {

        msg = "⬆ HIGHER";

    }

    hint.innerHTML = msg;

    let list = roomData.history || [];

    list.push(myPlayer + " guessed " + guess + " : " + msg);

    const nextTurn =
        myPlayer === "player1" ? "player2" : "player1";

    await update(ref(db, "rooms/" + roomCode), {
        history: list,
        turn: guess === secret ? "" : nextTurn
    });

    guessInput.value = "";

};


// =======================
// History Update
// =======================

function loadHistory() {

    history.innerHTML = "";

    const list = roomData.history || [];

    list.forEach(item => {

        const li = document.createElement("li");

        li.innerText = item;

        history.appendChild(li);

    });

}
// =======================
// Winner Sync
// =======================

function checkWinner() {

    if (!roomData.winner) return;

    if (roomData.winner === myPlayer) {

        winner.innerHTML = "🏆 YOU WIN!";

    } else {

        winner.innerHTML = "😢 YOU LOSE!";

    }

    guessBox.style.display = "none";

    restartBtn.style.display = "block";

}


// =======================
// Restart Game
// =======================

restartBtn.onclick = async () => {

    if(myPlayer=="player1"){

        await update(ref(db,"rooms/"+roomCode),{
            rematch1:true
        });

    }else{

        await update(ref(db,"rooms/"+roomCode),{
            rematch2:true
        });

    }

    restartBtn.style.display="none";
    status.innerHTML="Waiting for opponent...";
};


// =======================
// Update All UI
// =======================

function updateAllUI() {

    updateGameUI();

    loadHistory();

    checkWinner();

}