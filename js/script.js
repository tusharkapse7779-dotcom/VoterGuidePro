const chatContainer = document.getElementById("chatContainer");
const input = document.getElementById("userInput");
const btn = document.getElementById("sendBtn");

btn.onclick = sendMessage;
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    let msg = input.value.trim();
    if (!msg) return;

    addMessage(msg, "user");
    input.value = "";

    addMessage("Typing...", "bot");

    setTimeout(() => {
        removeLastMessage();
        addMessage(getResponse(msg.toLowerCase()), "bot");
    }, 800);
}

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

function getResponse(msg) {

    if (msg.includes("start")) {
        return "Election Steps:<br>1. Register<br>2. Vote<br>3. Results";
    }

    if (msg.includes("timeline")) {
        return "Timeline:<br>Registration → Voting → Counting → Results";
    }

    if (msg.includes("vote")) {
        return "Voting is done at polling booths using voter ID.";
    }

    return "Try: start / timeline / vote";
}
