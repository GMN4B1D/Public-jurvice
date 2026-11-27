const API_URL = "https://mute-bread-391a.gmnabid6.workers.dev/api/chat";

const chat = document.getElementById("chat");
const form = document.getElementById("chatForm");
const input = document.getElementById("message");
const sendButton = document.getElementById("sendButton");
const welcome = document.getElementById("welcome");

let busy = false;
let voiceMode = false;

function addMessage(text, type) {
  const el = document.createElement("div");
  el.className = "message " + type;
  el.textContent = text;
  chat.appendChild(el);
  el.scrollIntoView({ behavior: "smooth", block: "end" });
  return el;
}

async function sendMessage(text) {
  if (!text.trim() || busy) return;

  welcome.style.display = "none";
  addMessage(text, "user-message");
  input.value = "";

  busy = true;
  sendButton.disabled = true;

  const loading = addMessage("JARVIS is thinking...", "ai-message");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Server error " + response.status);
    }

    const answer = data.reply || data.response || data.message;

    if (!answer || !String(answer).trim()) {
      throw new Error("AI returned an empty response.");
    }

    loading.textContent = answer;

    if (voiceMode) speak(answer);

  } catch (error) {
    loading.textContent = "JARVIS ERROR: " +
      (error.name === "AbortError" ? "Request timed out." : error.message);
  } finally {
    busy = false;
    sendButton.disabled = false;
    voiceMode = false;
  }
}

form.addEventListener("submit", e => {
  e.preventDefault();
  sendMessage(input.value);
});

input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

document.getElementById("newChat").onclick = () => {
  chat.innerHTML = "";
  welcome.style.display = "";
  input.value = "";
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
};

document.getElementById("menuBtn").onclick = () => {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("overlay").classList.toggle("show");
};

document.getElementById("overlay").onclick = () => {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
};

function startVoice() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice input is not supported in this browser. Try a supported browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "bn-BD";
  recognition.interimResults = false;

  recognition.onresult = event => {
    const spoken = event.results[0][0].transcript;
    input.value = spoken;
    sendMessage(spoken);
  };

  recognition.onerror = () => {
    alert("Voice recognition failed. Please try again.");
  };

  recognition.start();
}

document.getElementById("voiceInput").onclick = startVoice;

document.getElementById("voiceChat").onclick = () => {
  voiceMode = true;
  startVoice();
};

function speak(text) {
  if (!("speechSynthesis" in window)) return;

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = /[\u0980-\u09FF]/.test(text) ? "bn-BD" : "en-US";
  utterance.rate = 1;
  speechSynthesis.speak(utterance);
}

document.querySelectorAll("[data-tool]").forEach(button => {
  button.addEventListener("click", () => {
    const tool = button.dataset.tool;

    if (tool === "Chat") {
      input.focus();
      return;
    }

    input.value = "I want to use JARVIS " + tool +
      " Studio. Help me with this task.";
    input.focus();
  });
});

document.getElementById("searchBtn").onclick = () => {
  input.focus();
};
