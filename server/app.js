const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('JWT Auth API running');
});

app.use('/auth', require('./routes/auth'));
app.use('/profile', require('./routes/profile'));
app.use('/session', require('./routes/session'));
app.use('/fish', require('./routes/fish'));

module.exports = app;
