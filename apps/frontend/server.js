// This is a simple Node.js Express server to serve the static HTML file.
// In a real-world scenario, you might have more complex backend logic here.

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080; // OpenShift typically exposes on 8080 by default

// Serve static files from the 'public' directory
// We'll place index.html directly in the root for simplicity in this example
app.use(express.static(path.join(__dirname)));

// Route for the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Basic health check endpoint
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

// Start the server
app.listen(port, () => {
    console.log(`Retro Arcade Hub frontend listening on port ${port}`);
});

// Graceful shutdown (important for Kubernetes/OpenShift)
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    app.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});
