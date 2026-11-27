
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
  chat.scrollTop = chat.scrollHeight;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error("Server error: " + response.status);
    }

    const data = await response.json();
    loading.remove();

    const reply =
      data.reply ||
      data.response ||
      data.text ||
      "I could not understand the response.";

    addMessage(reply, "assistant");

  } catch (error) {
    loading.remove();
    addMessage(
      "Connection error. Please check your internet or backend.",
      "assistant"
    );
    console.error(error);
  }
});
