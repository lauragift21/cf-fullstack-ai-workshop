document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatMessages = document.getElementById('chat-messages');
  const uploadForm = document.getElementById('upload-form');
  const documentsList = document.getElementById('documents');

  // Handle document uploads
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('document-upload');

    if (fileInput.files.length === 0) {
      alert('Please select a file to upload');
      return;
    }

    // Simple document listing for now
    Array.from(fileInput.files).forEach((file) => {
      const listItem = document.createElement('li');
      listItem.textContent = file.name;
      documentsList.appendChild(listItem);
    });

    // We'll implement actual upload in future steps
  });

  // Handle chat interactions
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();

    if (!message) return;

    addMessage(message, 'user');
    userInput.value = '';

    const typingEl = addMessage('Assistant is thinking...', 'assistant', true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const response = data.message?.response || 'No response received.';
      typingEl.innerHTML = marked.parse(response);
    } catch (error) {
      console.error('Chat error:', error);
      typingEl.innerHTML = 'Failed to get a response. Please try again.';
    }
  });

  function addMessage(content, sender, returnEl = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.innerHTML = marked.parse(content);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return returnEl ? messageDiv : null;
  }
});
