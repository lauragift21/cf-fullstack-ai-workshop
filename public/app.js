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

    // Display user message
    addMessage(message, 'user');
    userInput.value = '';

    // Show typing indicator
    const typingEl = addMessage('Assistant is thinking...', 'assistant', true);

    try {
      // Send to backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

			typingEl.innerHTML = marked.parse(data.message);

    } catch (error) {
      typingEl.textContent = '❌ Failed to get a response. Please try again.';
      console.error('Error:', error);
      addMessage('Sorry, there was an error processing your request.', 'assistant');
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
