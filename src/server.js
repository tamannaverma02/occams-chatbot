const express = require('express');
const { createChatbot } = require('./chatbot');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize chatbot
let chatbot;
(async () => {
  chatbot = await createChatbot();
})();

// API endpoint for chatbot queries
app.post('/api/chat', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const response = await chatbot(query);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});