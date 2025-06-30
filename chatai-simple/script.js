const ws = new WebSocket("ws://localhost:5000");
let currentChat = [];

ws.onopen = () => {
    console.log("✅ WebSocket connected");
};

ws.onmessage = (event) => {
    const reply = event.data;
    addMessage("Gini", reply);
};

function sendMessage() {
    const input = document.getElementById("message");
    const msg = input.value.trim();
    if (!msg) return;

    addMessage("You", msg);
    ws.send(msg);
    input.value = "";
}

function addMessage(sender, text) {
    const chatBox = document.getElementById("chat-box");
    const msg = document.createElement("p");
    msg.className = sender === "You" ? "user" : "ai";
    msg.innerText = `${sender}: ${text}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;

    currentChat.push(`${sender}: ${text}`);
    saveHistory();
}

function newChat() {
    document.getElementById("chat-box").innerHTML = "";
    currentChat = [];
    saveHistory();
}

function toggleHistory() {
    const box = document.getElementById("history-box");
    if (box.style.display === "none") {
        showHistory();
        box.style.display = "block";
    } else {
        box.style.display = "none";
    }
}

function saveHistory() {
    let history = JSON.parse(localStorage.getItem("chatHistory")) || [];
    history.push([...currentChat]);
    localStorage.setItem("chatHistory", JSON.stringify(history));
}

function showHistory() {
    const historyBox = document.getElementById("history-box");
    const history = JSON.parse(localStorage.getItem("chatHistory")) || [];

    historyBox.innerHTML = "<strong>Past Chats:</strong><br><br>";
    history.forEach((session, i) => {
        historyBox.innerHTML += `<div><em>Session ${i + 1}:</em><br>${session.join("<br>")}<br><br></div>`;
    });
}
