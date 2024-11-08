const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// Set Content Security Policy to allow external fonts and styles for testing
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; script-src 'self';"
    );
    next();
});



// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../game-api')));

// Import questions from questions.json
const questions = require('./public/questions.json');

// API endpoint to get all questions
app.get('/api/questions', (req, res) => {
    res.json(questions);
});

// API endpoint to get a specific question by index
app.get('/api/questions/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);
    if (index >= 0 && index < questions.length) {
        res.json(questions[index]);
    } else {
        res.status(404).json({ error: "Question not found" });
    }
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
