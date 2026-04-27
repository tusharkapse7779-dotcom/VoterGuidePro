const chatContainer = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const btn = document.getElementById("sendBtn");

let currentStep = 0;

// 📊 Analytics (stored locally)
let analytics = {
    opens: localStorage.getItem("opens") || 0,
    messages: localStorage.getItem("messages") || 0,
};

analytics.opens++;
localStorage.setItem("opens", analytics.opens);

// 🇮🇳 Election Steps
const steps = [
    { title: "1️⃣ Registration", text: "Register via NVSP portal with ID & address proof." },
    { title: "2️⃣ Voter ID (EPIC)", text: "Get your voter ID card after approval." },
    { title: "3️⃣ Nomination", text: "Candidates file nominations under ECI rules." },
    { title: "4️⃣ Campaign", text: "Political campaigns begin with code of conduct." },
    { title: "5️⃣ Voting Day", text: "Vote using EVM at your polling booth." },
    { title: "6️⃣ Counting", text: "Votes counted with EVM + VVPAT." },
    { title: "7️⃣ Results", text: "Winner announced officially." }
];

// EVENTS
btn.onclick = sendMessage;
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    let msg = input.value.trim();
    if (!msg) return;

    analytics.messages++;
    localStorage.setItem("messages", analytics.messages);

    addMessage(msg, "user");
    input.value = "";

    addMessage("Typing...", "bot");

    setTimeout(() => {
        removeLastMessage();
        addMessage(generateResponse(msg.toLowerCase()), "bot");
    }, 700);
}

// UI FUNCTIONS
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

function quick(text) {
    input.value = text;
    sendMessage();
}

// 🌍 GOOGLE MAPS BOOTH LINK
function getMapLink() {
    return `https://www.google.com/maps/search/polling+booth+near+me`;
}

// 🤖 AI RESPONSE (SIMULATED STRUCTURE)
function aiResponse(query) {
    return `
    🤖 <b>AI Assistant:</b><br>
    ${query} is part of the election process. Please follow official ECI guidelines.<br>
    `;
}

// CORE LOGIC
function generateResponse(msg) {

    if (msg.includes("start")) {
        currentStep = 0;
        return `
        🇮🇳 <b>Election Process (India)</b><br><br>
        ${steps.map(s => `<br>${s.title}`).join("")}
        <br><br>Type <b>next</b> to continue
        `;
    }

    if (msg.includes("next")) {
        if (currentStep < steps.length) {
            let s = steps[currentStep++];
            return `<b>${s.title}</b><br>${s.text}`;
        }
        return "✅ Completed all steps!";
    }

    if (msg.includes("booth") || msg.includes("location")) {
        return `
        📍 <b>Find Polling Booth:</b><br>
        <a href="${getMapLink()}" target="_blank">Open in Google Maps</a>
        `;
    }

    if (msg.includes("register")) {
        return `
        🧾 <b>Register Here:</b><br>
        https://nvsp.in
        `;
    }

    if (msg.includes("vote")) {
        return `
        🗳️ <b>How to Vote:</b><br>
        - Carry voter ID<br>
        - Go to polling booth<br>
        - Use EVM machine<br>
        `;
    }

    if (msg.includes("analytics")) {
        return `
        📊 <b>App Analytics:</b><br>
        Opens: ${analytics.opens}<br>
        Messages: ${analytics.messages}
        `;
    }

    // fallback AI
    return aiResponse(msg);
}
