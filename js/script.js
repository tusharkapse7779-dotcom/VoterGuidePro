const chatContainer = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const btn = document.getElementById("sendBtn");

// SEND MESSAGE
btn.onclick = sendMessage;
input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    const msg = input.value.trim();
    if (!msg) return;

    addMessage(msg, "user");
    input.value = "";

    addMessage("Thinking...", "bot");

    getGeminiResponse(msg);
}

// UI
function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = "message " + type;

    const content = document.createElement("div");
    content.className = "message-content";
    content.innerHTML = text;

    div.appendChild(content);
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// CALL BACKEND (SECURE)
async function getGeminiResponse(message) {
    try {
        const res = await fetch("/api/gemini", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        const data = await res.json();

        // remove "Thinking..."
        chatContainer.removeChild(chatContainer.lastChild);

        addMessage(data.reply, "bot");

    } catch (err) {
        chatContainer.removeChild(chatContainer.lastChild);
        addMessage("⚠️ Error connecting to AI", "bot");
    }
}

// QUICK BUTTONS
function quick(text) {
    input.value = text;
    sendMessage();
}
