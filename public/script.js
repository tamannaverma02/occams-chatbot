async function sendQuery() {
    const queryInput = document.getElementById('queryInput');
    const chatBox = document.getElementById('chatBox');
    const query = queryInput.value.trim();
  
    if (!query) return;
  
    // Display user query
    const userMessage = document.createElement('p');
    userMessage.innerHTML = `<strong>You:</strong> ${query}`;
    chatBox.appendChild(userMessage);
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
  
      // Display chatbot response
      const botMessage = document.createElement('p');
      botMessage.innerHTML = `<strong>Chatbot:</strong> ${data.response}`;
      chatBox.appendChild(botMessage);
    } catch (error) {
      const errorMessage = document.createElement('p');
      errorMessage.innerHTML = `<strong>Chatbot:</strong> Error: Could not process your request.`;
      chatBox.appendChild(errorMessage);
    }
  
    // Clear input and scroll to bottom
    queryInput.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  
  // Allow Enter key to send query
  document.getElementById('queryInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendQuery();
  });