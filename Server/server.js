require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 7000;

// Connect to MongoDB
connectDB();

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));
// app.use(cors());

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json 
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//serve static files
app.get('/', (req, res) => {
  res.json({ message: 'Hello form RecallCode backend..' });
});

// routes
app.use('/register', require('./routes/register'));
app.use('/verifyOtp', require('./routes/verifyOtp'));
app.use('/resendOtp', require('./routes/resendOtp'));
app.use('/forgotpass', require('./routes/forgotPass'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/trialQues', require('./routes/trialQuestions'));

app.use(verifyJWT);
app.use('/logout', require('./routes/api/logout'));
app.use('/users', require('./routes/api/users'));
app.use('/passChange', require('./routes/api/passChange'));
app.use('/practice', require('./routes/api/practice'));
app.use('/resetProgress', require('./routes/resetProgress'));
app.use('/selective', require('./routes/api/selective'));
app.use('/challenge', require('./routes/api/challenge'));


app.all('/*splat', (req, res) => {
    res.status(404).json({meggage:"404 Not Found "});
    if (req.accepts('html')) {
        res.json({ "error": "404 Not Found " });
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT,"0.0.0.0", () => console.log(`Server running on port ${PORT}`));
});