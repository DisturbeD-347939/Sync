var express = require('express');
var router = express.Router();
var path = require('path');

var indexRouter = require('./routes/index');
//

var app = express();

//Views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// serve static files from the `public` folder
app.use(express.static(__dirname + '/public'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/*************************************** ROUTES **************************************************** */

app.use('/', indexRouter);
//app.use('/result', resultsRouter);

app.use(express.static('routes'));

module.exports = app, router;

/*************************************** START **************************************************** */

//Server
const server = app.listen(3000, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});