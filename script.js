
const API_URL = "https://mute-bread-391a.gmnabid6.workers.dev/api/chat";

const chat = document.getElementById("chat");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("sendButton");

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
  if (!message || sendButton.disabled) return;

  addMessage(message, "user");
  messageInput.value = "";

  sendButton.disabled = true;
  sendButton.textContent = "...";

  const loading = document.createElement("div");
  loading.className = "message assistant";
  loading.textContent = "JARVIS is thinking...";
  chat.appendChild(loading);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message }),
      signal: controller.signal
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.details || result.error || `HTTP ${response.status}`
      );
    }

    if (!result.reply) {
      throw new Error("JARVIS returned an empty response.");
    }

    loading.remove();
    addMessage(result.reply, "assistant");

  } catch (error) {
    loading.remove();

    if (error.name === "AbortError") {
      addMessage(
        "JARVIS request timed out. Please try again.",
        "assistant"
      );
    } else {
      addMessage(
        "JARVIS ERROR: " + error.message,
        "assistant"
      );
    }

    console.error(error);

  } finally {
    clearTimeout(timeout);
    sendButton.disabled = false;
    sendButton.textContent = "SEND";
  }
});
