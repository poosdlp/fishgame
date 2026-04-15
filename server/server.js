require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.set('trust proxy', 1);

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('JWT Auth API running');
});

const connectDB = require('./config/db');
connectDB();

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const profileRoutes = require('./routes/profile');
app.use('/profile', profileRoutes);

const sessionRoutes = require('./routes/session');
app.use('/session', sessionRoutes);

const { setupWebSocket } = require('./ws');

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

setupWebSocket(server);