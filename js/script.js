const chatContainer = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const btn = document.getElementById("sendBtn");

let currentStep = 0;
let lastIntent = "";

// 📊 Analytics
let analytics = {
    opens: parseInt(localStorage.getItem("opens") || "0"),
    messages: parseInt(localStorage.getItem("messages") || "0"),
};
analytics.opens++;
localStorage.setItem("opens", analytics.opens);

// 🌐 Language Detection (basic)
function detectLanguage(text) {
    if (/[अ-ह]/.test(text)) return "hi";
    if (/[अ-ज्ञ]/.test(text)) return "mr";
    return "en";
}

// 🌍 Location (Google-level feature)
function getUserLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                resolve({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
            },
            () => reject("Location denied")
        );
    });
}

// 🗳️ Election Steps
const steps = [
    "Registration",
    "Voter ID (EPIC)",
    "Nomination",
    "Campaign",
    "Voting Day",
    "Counting",
    "Results"
];

// UI EVENTS
btn.onclick = sendMessage;
input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
});

// SEND MESSAGE
function sendMessage() {
    let msg = input.value.trim();
    if (!msg) return;

    analytics.messages++;
    localStorage.setItem("messages", analytics.messages);

    addMessage(msg, "user");
    input.value = "";

    addMessage("Typing...", "bot");

    setTimeout(async () => {
        removeLastMessage();
        let res = await generateResponse(msg);
        addMessage(res, "bot");
    }, 600);
}

// UI
function addMessage(text, type) {
    let div = document.createElement("div");
    div.className = "message " + type;

    let content = document.createElement("div");
    content.className = "message-content";
    content.innerHTML = text;

    div.appendChild(content);
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeLastMessage() {
    chatContainer.removeChild(chatContainer.lastChild);
}

// 🧠 INTENT DETECTION
function detectIntent(msg) {
    if (msg.includes("start")) return "start";
    if (msg.includes("next")) return "next";
    if (msg.includes("timeline")) return "timeline";
    if (msg.includes("booth") || msg.includes("location")) return "booth";
    if (msg.includes("register")) return "register";
    if (msg.includes("vote")) return "vote";
    if (msg.includes("analytics")) return "analytics";
    return "ai";
}

// 📅 Dynamic Phase
function getPhase() {
    const m = new Date().getMonth();
    return ["Registration","Nomination","Campaign","Voting","Counting","Results"][Math.floor(m/2)];
}

// 🤖 (Gemini-ready placeholder)
async function aiResponse(query) {
    return `
    🤖 <b>AI Insight</b><br>
    "${query}" is related to election awareness.<br><br>
    📍 Current Phase: <b>${getPhase()}</b><br>
    💡 Ask: start / timeline / vote / booth
    `;
}

// CORE ENGINE
async function generateResponse(msgRaw) {
    const msg = msgRaw.toLowerCase();
    const intent = detectIntent(msg);
    lastIntent = intent;

    // START
    if (intent === "start") {
        currentStep = 0;
        return `
        🇮🇳 <b>Election Process</b><br><br>
        ${steps.map((s,i)=>`${i+1}. ${s}`).join("<br>")}
        <br><br>👉 Type <b>next</b>
        `;
    }

    // NEXT
    if (intent === "next") {
        if (currentStep < steps.length) {
            return `📍 Step ${currentStep+1}: <b>${steps[currentStep++]}</b>`;
        }
        return "✅ Process completed!";
    }

    // TIMELINE
    if (intent === "timeline") {
        return `
        📅 <b>Timeline</b><br><br>
        ${steps.join(" → ")}<br><br>
        📍 Current Phase: <b>${getPhase()}</b>
        `;
    }

    // BOOTH (REAL FEATURE 🔥)
    if (intent === "booth") {
        try {
            const loc = await getUserLocation();
            return `
            📍 <b>Nearby Booth</b><br>
            <a href="https://www.google.com/maps?q=${loc.lat},${loc.lng}" target="_blank">
            Open in Google Maps
            </a>
            `;
        } catch {
            return "⚠️ Location permission denied.";
        }
    }

    // REGISTER
    if (intent === "register") {
        return `
        🧾 Register here:<br>
        https://nvsp.in
        `;
    }

    // VOTE
    if (intent === "vote") {
        return `
        🗳️ Voting Steps:<br>
        - Carry ID<br>
        - Go to booth<br>
        - Use EVM
        `;
    }

    // ANALYTICS
    if (intent === "analytics") {
        return `
        📊 Opens: ${analytics.opens}<br>
        💬 Messages: ${analytics.messages}
        `;
    }

    // SMART AI
    return await aiResponse(msg);
}
