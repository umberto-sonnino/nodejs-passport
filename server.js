var express = require('express');
var app = express();
var port = process.env.PORT || 8050;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var server = require('http').Server(app);
var io = require('socket.io')(server);
var squares = io.of('/squares');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');

// config
// ======
mongoose.connect(configDB.url);

require('./config/passport')(passport); //passport for configuration

//setup for express
app.use(morgan('dev')); //log requests to console
app.use(cookieParser()); //read cookies -> auth
app.use(bodyParser.urlencoded(
	{extended: true}
));	//information from html forms
app.use(bodyParser.json());

// for embedded javascript into pages
app.set('view engine', 'ejs'); //ejs for templating

//setup for passport
app.use(session(
{
	secret:'bettoismysecretlover',
 	resave: false,
    saveUninitialized : false
})); 
app.use(passport.initialize());
app.use(passport.session()); //persistent login sessions
app.use(flash());	//use connect-flash for flash messages stored in session

//routes
//======
require('./app/routes.js')(app, passport, io); 
require('./app/chat_routes.js')(app, passport, squares);
require('./app/square_routes.js')(app, passport);
//load routes and pass in our app and passport configured successfully

// app.listen(port);
server.listen(port);
console.log("Live magic on port " + port);

