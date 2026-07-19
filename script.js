import { db, ref, set, get, update, onValue } from "./firebase.js";

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

let roomCode = "";
let myPlayer = "";
let roomData = {};

function randomRoom() {

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";

    let code = "";

    for (let i = 0; i < 6; i++) {

        code += chars[Math.floor(Math.random() * chars.length)];

    }

    return code;

}

createBtn.onclick = async () => {

    roomCode = randomRoom();

    myPlayer = "player1";

    await set(ref(db, "rooms/" + roomCode), {

        player1: {

            joined: true,
            ready: false,
            secret: 0

        },

        player2: {

            joined: false,
            ready: false,
            secret: 0

        },

        turn: "",

        winner: "",

        state: "waiting"

    });

    roomInput.value = roomCode;

    status.innerHTML = "Room : " + roomCode + "<br>Waiting for Player 2";

    game.style.display = "block";

    watchRoom();

};

joinBtn.onclick = async () => {

    roomCode = roomInput.value.trim().toUpperCase();

    if (roomCode == "") {

        alert("Enter Room Code");

        return;

    }

    const snap = await get(ref(db, "rooms/" + roomCode));

    if (!snap.exists()) {

        alert("Room not found");

        return;

    }

    myPlayer = "player2";

    await update(ref(db, "rooms/" + roomCode + "/player2"), {

        joined: true

    });

    game.style.display = "block";

    status.innerHTML = "Joined Room";

    watchRoom();

};

function watchRoom() {

    onValue(ref(db, "rooms/" + roomCode), (snap) => {

        if (!snap.exists()) return;

        roomData = snap.val();

        if (roomData.player1.joined &&
            roomData.player2.joined) {

            status.innerHTML = "Both Players Connected";

        }

    });

}