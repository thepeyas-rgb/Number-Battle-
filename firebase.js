import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAyS-ov2O_abR-r25O7P-LjfQ9BtDfp0Jc",
  authDomain: "number-8cd44.firebaseapp.com",
  databaseURL: "https://number-8cd44-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "number-8cd44",
  storageBucket: "number-8cd44.firebasestorage.app",
  messagingSenderId: "1078813582251",
  appId: "1:1078813582251:web:9e1eb60c2ee7b5c5b7e8ee"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, get, update, onValue };