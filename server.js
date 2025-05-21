const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Load environment variables from .env file
dotenv.config();

// Initialize express app
const app = express();

// Load Swagger YAML documentation
const swaggerDocument = YAML.load('./docs/swagger.yaml');

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
app.use('/auth', require('./routes/auth')); // Local login/register (simple)
app.use('/api/habits', require('./routes/habitRoutes')); // Habit management
app.use('/api/logs', require('./routes/logRoutes'));     // Habit logs

// Root Route
app.get('/', (req, res) => {
    res.send('🌱 Welcome to the Habit Tracker API');
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});