
const API_URL = "https://mute-bread-391a.gmnabid6.workers.dev";

const input = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const home = document.getElementById("homeScreen");
const chat = document.getElementById("chatScreen");
const sendBtn = document.getElementById("sendBtn");
const provider = document.getElementById("provider");

function openChat() {
  home.style.display = "none";
  chat.classList.add("active");
}

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

async function sendMessage() {
  const message = input.value.trim();
  if (!message || sendBtn.disabled) return;

  openChat();
  addMessage(message, "user");
  input.value = "";
  sendBtn.disabled = true;

  const loading = addMessage("JARVIS is thinking...", "ai");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        provider: provider.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI request failed");
    }

    loading.textContent = data.reply || "No response received.";

  } catch (error) {
    loading.textContent = "Connection error: " + error.message;
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", event => {
  if (event.key === "Enter") sendMessage();
});

document.querySelectorAll(".tool-card").forEach(card => {
  card.addEventListener("click", () => {
    input.value = card.dataset.prompt || "";
    input.focus();
  });
});

document.getElementById("clearBtn").addEventListener("click", () => {
  messages.innerHTML = "";
});

document.getElementById("menuBtn").addEventListener("click", () => {
  alert("JARVIS menu");
});

document.getElementById("searchBtn").addEventListener("click", () => {
  input.focus();
});

document.getElementById("attachBtn").addEventListener("click", () => {
  document.getElementById("fileInput").click();
});

document.getElementById("imageBtn").addEventListener("click", () => {
  document.getElementById("fileInput").click();
});

document.getElementById("fileInput").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  input.value = `Please help me understand this image: ${file.name}`;
  alert("Image preview and AI image analysis will be connected in the next update.");
});

const Recognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

document.getElementById("micBtn").addEventListener("click", () => {
  if (!Recognition) {
    alert("Voice input is not supported in this browser.");
    return;
  }

  const recognition = new Recognition();
  recognition.lang = "bn-BD";
  recognition.onresult = event => {
    input.value = event.results[0][0].transcript;
    input.focus();
  };
  recognition.start();
});

document.getElementById("voiceBtn").addEventListener("click", () => {
  if (!Recognition) {
    alert("Voice input is not supported in this browser.");
    return;
  }

  const recognition = new Recognition();
  recognition.lang = "bn-BD";
  recognition.onresult = event => {
    input.value = event.results[0][0].transcript;
    sendMessage();
  };
  recognition.start();
});
