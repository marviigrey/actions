const express = require('express');
const path = require('path');
const { connectDB } = require('./config/db');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;
const host = '0.0.0.0';

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', routes);

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Export for testing
module.exports = { app, startServer };

if (require.main === module) {
  startServer();
}
