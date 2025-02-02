
let chatHistory = [];
let uploadedFile = null;

async function sendMessage() {
  let inputField = document.getElementById("chat-input");
  let messageArea = document.getElementById("message-area");
  let message = inputField.value.trim();

  // Check if the message is a greeting (hi, hello, hey)
  if (["hi", "hello", "hey"].includes(message.toLowerCase())) {
    let greetingMessage = "Hi, I am HelpMate. How can I assist you? I can help you with various tasks.";
    
    // Display the user's message with the logo on the right
    let messageElement = document.createElement("div");
    messageElement.classList.add("message", "user-message");
    messageElement.innerHTML = `<div class="message-content">
                                 <div class="message-text">${message}</div>
                                 <div class="user-logo"><img src="user.png" alt="User Logo" width="20px"></div>
                               </div>`;
    messageArea.appendChild(messageElement);

    // Display the bot's greeting message with bot logo on the left
    let aiChatElement = document.createElement("div");
    aiChatElement.classList.add("message", "ai-message");
    aiChatElement.innerHTML = `<div class="message-content">
                                 <div class="bot-logo"><img src="ai.png" alt="Bot Logo" width="20px"></div>
                                 <div class="message-text">${greetingMessage}</div>
                               </div>`;
    messageArea.appendChild(aiChatElement);

    // Scroll to the bottom
    scrollToBottom();

    // Reset the input field
    inputField.value = "";
    uploadedFile = null;
    document.getElementById("file-preview-container").innerHTML = "";

    return; // Exit the function after sending the greeting
  }

  if (message !== "" || uploadedFile) {
    let messageElement = document.createElement("div");

    // Add user message class for right alignment
    messageElement.classList.add("message", "user-message");

    // If there's a file, display its name or preview
    if (uploadedFile) {
      let filePreviewElement = document.createElement("div");
      filePreviewElement.classList.add("file-preview");
      filePreviewElement.textContent = `File: ${uploadedFile.name}`;
      messageElement.appendChild(filePreviewElement);
    }

    // Append the message text with user logo on the right
    messageElement.innerHTML = `<div class="message-content">
                                 <div class="message-text">${message}</div>
                                 <div class="user-logo"><img src="user.png" alt="User Logo" width="20px"></div>
                               </div>`;

    messageArea.appendChild(messageElement);

    // Reset the message and file
    inputField.value = "";
    uploadedFile = null;

    // Clear file preview
    document.getElementById("file-preview-container").innerHTML = "";

    // Scroll to the bottom
    scrollToBottom();

    // After the user sends the message, trigger backend response
    await generateAIResponse(messageElement, message);
  }
}

async function generateAIResponse(userChatElement, userMessage) {
  const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=your_api_key";
  
  // Simulate typing indicator
  let aiChatElement = document.createElement("div");
  aiChatElement.classList.add("message", "ai-message");
  aiChatElement.innerHTML = `<div class="message-content">
                               <div class="bot-logo"><img src="ai.png" alt="Bot Logo" width="20px"></div>
                               <div class="message-text"><img src="loading.gif" alt="Loading" width="50px"></div>
                             </div>`;
  document.getElementById("message-area").appendChild(aiChatElement);

  // Scroll to the bottom after adding the typing indicator
  scrollToBottom();

  let response;
  try {
    let requestOptions = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "contents": [{ "parts": [{ "text": userMessage }] }]
      })
    };

    let fetchResponse = await fetch(Api_Url, requestOptions);
    let data = await fetchResponse.json();
    let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
    
    // Update AI's message with bot logo on the left
    aiChatElement.innerHTML = `<div class="message-content">
                                 <div class="bot-logo"><img src="ai.png" alt="Bot Logo" width="20px"></div>
                                 <div class="message-text">${apiResponse}</div>
                               </div>`;
  } catch (error) {
    console.log(error);
    aiChatElement.innerHTML = `<div class="message-content">
                                 <div class="bot-logo"><img src="ai.png" alt="Bot Logo" width="20px"></div>
                                 <div class="message-text">Error fetching response.</div>
                               </div>`;
  } finally {
    // Scroll to the bottom after response
    scrollToBottom();
  }
}

// Function to scroll to the bottom of the message area
function scrollToBottom() {
  let messageArea = document.getElementById("message-area");
  messageArea.scrollTop = messageArea.scrollHeight;
}

// Function to handle "Enter" key press
function handleKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

function createNewChat() {
  let pastChats = document.getElementById("past-chats");
  let messageArea = document.getElementById("message-area");

  if (messageArea.innerHTML.trim() !== "") {
    let chatSummary = `Chat ${chatHistory.length + 1}`;
    let chatItem = document.createElement("div");
    chatItem.classList.add("chat-item");

    let chatText = document.createElement("span");
    chatText.textContent = chatSummary;
    chatText.onclick = () => loadChat(chatSummary);

    let deleteButton = document.createElement("button");
    deleteButton.textContent = "✖";
    deleteButton.classList.add("delete-chat");
    deleteButton.onclick = (event) => {
      event.stopPropagation();
      let index = chatHistory.findIndex((chat) => chat.name === chatSummary);
      if (index !== -1) chatHistory.splice(index, 1);
      pastChats.removeChild(chatItem);
    };

    chatItem.appendChild(chatText);
    chatItem.appendChild(deleteButton);
    pastChats.appendChild(chatItem);
    chatHistory.push({
      name: chatSummary,
      content: messageArea.innerHTML,
    });
  }
  messageArea.innerHTML = "";
}

function loadChat(chatName) {
  let chat = chatHistory.find((c) => c.name === chatName);
  if (chat) {
    document.getElementById("message-area").innerHTML = chat.content;
    // Scroll to the bottom when loading a chat
    scrollToBottom();
  }
}

function triggerFileUpload() {
  document.getElementById("file-input").click();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    uploadedFile = file;

    // Display file preview or name next to the submit button
    let filePreviewContainer = document.getElementById("file-preview-container");
    filePreviewContainer.innerHTML = ""; // Clear previous previews

    let filePreview = document.createElement("div");
    filePreview.classList.add("file-preview");
    filePreview.textContent = `File: ${file.name}`;
    filePreviewContainer.appendChild(filePreview);
  }
}
