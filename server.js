const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Initialize express app
const app = express();

// Load Swagger JSON documentation
const swaggerDocument = require('./swagger.json'); // Ensure this file exists and is valid

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Swagger Docs Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
try {
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/habits', require('./routes/habitRoutes'));
    app.use('/api/logs', require('./routes/logRoutes'));
} catch (error) {
    console.error('❌ Route loading error:', error.message);
}

// Root Route
app.get('/', (req, res) => {
    res.send('🌱 Welcome to the Habit Tracker API');
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});