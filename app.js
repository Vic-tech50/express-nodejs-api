var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fetch = require('node-fetch');
const cors = require('cors');
// npm install twilio
const twilio = require('twilio');
const bodyParser = require('body-parser'); // To parse form data if needed



// Twilio client initialization
// const client = new twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// Middleware
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

const pushTokens = new Set();

var dotenv =  require('dotenv'); //npm install dotenv
dotenv.config(); //load .env file

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var crudRouter = require('./routes/crud');
var authRouter = require('./routes/auth');
var authJWTRouter = require('./routes/authjwt');
var authSocialRouter = require('./routes/authsocial');
var emailRouter = require('./routes/email');
var pushRouter = require('./routes/push');
var smsRouter = require('./routes/sms');
var paymentRouter = require('./routes/payment');
var settingsRouter = require('./routes/settings');
var upload = require('./routes/crudupload'); // Import message routes
var otp = require('./routes/otp'); // Import message routes

var app = express();
app.use(cors());
app.use(express.json());

// app.use(express.json());
app.use(express.urlencoded({ extended: true })); //json parser

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/crud', crudRouter); // call crud route
app.use('/auth', authRouter); // call auth route
app.use('/auth/jwt', authJWTRouter); // call authjwt route
app.use('/auth/social', authSocialRouter); // call authsocial route
app.use('/email', emailRouter); // call email route
app.use('/push', pushRouter); // call push route
app.use('/sms', smsRouter); // call sms route
app.use('/payment', paymentRouter); // call payment route
app.use('/settings', settingsRouter); // call settings route
app.use('/upload/crud', upload); // call messages route
app.use('/otp', otp); // call otp route

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
