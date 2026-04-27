const chat = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const btn = document.getElementById("sendBtn");

// Analytics
let opens = localStorage.getItem("opens") || 0;
let messages = localStorage.getItem("messages") || 0;
opens++;
localStorage.setItem("opens", opens);

// EVENTS
btn.onclick = sendMessage;
input.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

function quick(text) {
  input.value = text;
  sendMessage();
}

// SEND MESSAGE
function sendMessage() {
  const msg = input.value.trim();
  if (!msg) return;

  messages++;
  localStorage.setItem("messages", messages);

  addMessage(msg, "user");
  input.value = "";

  addMessage("⏳ Thinking...", "bot");

  fetchAI(msg);
}

// UI
function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = "message " + type;

  const content = document.createElement("div");
  content.innerHTML = text;

  div.appendChild(content);
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// AI CALL
async function fetchAI(message) {
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    chat.removeChild(chat.lastChild);
    addMessage(data.reply, "bot");

  } catch {
    chat.removeChild(chat.lastChild);
    addMessage("⚠️ AI Error", "bot");
  }
}

// 🎙 Voice
function startVoice() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-IN";

  recognition.onresult = function(event) {
    input.value = event.results[0][0].transcript;
    sendMessage();
  };

  recognition.start();
}

// 📍 Booth Finder
function findBooth() {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    window.open(`https://www.google.com/maps?q=polling+booth+near+${latitude},${longitude}`);
  }, () => {
    addMessage("⚠️ Location permission denied", "bot");
  });
}

// 📊 Analytics
function showAnalytics() {
  addMessage(`
  📊 <b>Analytics</b><br><br>
  Opens: ${opens}<br>
  Messages: ${messages}
  `, "bot");
}
