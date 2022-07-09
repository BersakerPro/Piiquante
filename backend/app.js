
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');



const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize')


require('dotenv').config();

const app = express();

app.use(helmet());
app.use(mongoSanitize())

const loginDB = process.env.LOGINDB;
const password = process.env.PASSWORD;
const address = process.env.ADDRESS;
console.log(loginDB);

mongoose.connect(`mongodb+srv://${loginDB}:${password}@${address}`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', sauceRoutes);

app.use('/api/auth', userRoutes);

module.exports = app;