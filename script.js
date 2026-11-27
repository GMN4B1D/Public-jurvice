
const API_URL = "https://mute-bread-391a.gmnabid6.workers.dev/api/chat";

const chat = document.getElementById("chat");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("message");

function addMessage(text, type) {
  const message = document.createElement("div");
  message.className = `message ${type}`;
  message.textContent = text;
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = messageInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  messageInput.value = "";

  const loading = document.createElement("div");
  loading.className = "message";
  loading.textContent = "JARVIS is thinking...";
  chat.appendChild(loading);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const result = await response.text();
    loading.remove();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${result}`);
    }

    let data;
    try {
      data = JSON.parse(result);
    } catch {
      throw new Error("Invalid JSON response: " + result);
    }

    const reply = data.reply || data.response || data.text;

    if (!reply) {
      throw new Error("No reply field found: " + result);
    }

    addMessage(reply, "assistant");

  } catch (error) {
    loading.remove();
    addMessage("JARVIS ERROR: " + error.message, "assistant");
    console.error(error);
  }
});
