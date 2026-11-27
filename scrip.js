
const API_BASE = "https://bitter-hill-e8b3.gmnabid6.workers.dev";

const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const chatPanel = document.getElementById("chatPanel");
const imagePanel = document.getElementById("imagePanel");

function addUserMessage(message) {
  const div = document.createElement("div");
  div.className = "user-message";
  div.textContent = message;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addAIMessage(message) {
  const div = document.createElement("div");
  div.className = "ai-message";

  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = "JARVIS";

  const paragraph = document.createElement("p");
  paragraph.textContent = message;

  div.append(label, paragraph);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return paragraph;
}

function openTool(tool) {
  document.querySelectorAll(".tool-card").forEach(card => {
    card.classList.toggle("selected", card.dataset.tool === tool);
  });

  if (tool === "video" || tool === "music") {
    alert(
      "This feature is not connected yet. A separate generation API is required."
    );
    return;
  }

  chatPanel.classList.toggle("hidden", tool === "image");
  imagePanel.classList.toggle("hidden", tool !== "image");

  if (tool === "code") {
    chatInput.placeholder = "Describe the code you want to create...";
    chatInput.focus();
  }

  if (tool === "chat") {
    chatInput.placeholder = "Enter your message...";
    chatInput.focus();
  }
}

// Tool card selection
document.querySelectorAll(".tool-card").forEach(card => {
  card.addEventListener("click", () => {
    openTool(card.dataset.tool);
  });
});

// Sidebar menu
document.getElementById("menuButton").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

// Sidebar navigation
document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    const view = button.dataset.view;

    document.getElementById("sidebar").classList.remove("open");

    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    if (view === "home") {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
      openTool("chat");
    } else {
      openTool(view);
    }
  });
});

// AI Chat
chatForm.addEventListener("submit", async event => {
  event.preventDefault();

  const message = chatInput.value.trim();

  if (!message) return;

  addUserMessage(message);
  chatInput.value = "";

  const replyElement = addAIMessage("Connecting to JARVIS...");

  const sendButton = document.getElementById("sendButton");
  sendButton.disabled = true;
  sendButton.textContent = "WAIT";

  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error || data.details || `Server error: ${response.status}`
      );
    }

    replyElement.textContent =
      data.reply || "JARVIS returned an empty response.";

  } catch (error) {
    replyElement.textContent =
      "Connection failed: " + error.message +
      ". Check your Cloudflare Worker, AI binding and model configuration.";

  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "SEND";
    chatInput.focus();
  }
});

// Enter to send, Shift + Enter for a new line
chatInput.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

// Image Generation
document.getElementById("generateImage").addEventListener("click", async () => {
  const prompt = document.getElementById("imagePrompt").value.trim();

  const button = document.getElementById("generateImage");
  const result = document.getElementById("imageResult");
  const download = document.getElementById("downloadImage");

  if (!prompt) {
    alert("Please describe the image first.");
    return;
  }

  button.disabled = true;
  button.textContent = "GENERATING...";
  result.textContent = "JARVIS is generating your image...";
  download.classList.add("hidden");

  try {
    const response = await fetch(`${API_BASE}/api/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt
      })
    });

    if (!response.ok) {
      let errorMessage = `Image request failed: ${response.status}`;

      try {
        const errorData = await response.json();
        errorMessage =
          errorData.error || errorData.details || errorMessage;
      } catch (error) {}

      throw new Error(errorMessage);
    }

    const blob = await response.blob();

    if (!blob.type.startsWith("image/")) {
      throw new Error("The server did not return an image.");
    }

    const imageURL = URL.createObjectURL(blob);

    const image = document.createElement("img");
    image.src = imageURL;
    image.alt = "Generated image";

    result.replaceChildren(image);

    download.href = imageURL;
    download.classList.remove("hidden");

  } catch (error) {
    result.textContent = "Image generation failed: " + error.message;

  } finally {
    button.disabled = false;
    button.textContent = "GENERATE IMAGE";
  }
});

// Backend connection check
async function checkBackend() {
  try {
    const response = await fetch(`${API_BASE}/`);
    const data = await response.json();

    console.log("JARVIS Backend:", data);

  } catch (error) {
    console.error("Backend connection failed:", error);
  }
}

checkBackend();
