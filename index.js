require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
const router = require('./routes/index');

const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use('/', router);

const start = async () => {
  try {
    http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
