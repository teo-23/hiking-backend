require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const cors = require('cors');


const session = require('express-session');
const passport = require('passport');

require('./configs/passport');

mongoose
    .connect(process.env.MONGODB_URI, {useNewUrlParser: true})
    .then(x => {
        console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
    })
    .catch(err => {
        console.error('Error connecting to mongo', err)
    });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// Express View engine setup
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    sourceMap: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// Sessions
app.use(session({
    secret: "some secret goes here", 
    resave: true, 
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// default value for title local
app.locals.title = 'Hi, King';

//Cors
// app.use(cors({
//     credentials: true, 
//     origin: ['https://distracted-ride-f0ae69.netlify.app/']
// }));

app.use(cors());


// ROUTES MIDDLEWARE STARTS HERE:
app.use('/api', require('./routes/trail-routes'));
app.use('/api', require('./routes/task-routes'));

const index = require('./routes/index');
app.use('/', index);

const authRoutes = require('./routes/auth-routes');
app.use('/api', authRoutes);

module.exports = app;