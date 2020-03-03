var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var router = express.Router();
var path = require('path');

var indexRouter = require('./routes/index');

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
server.listen(3000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

/*************************************** IO **************************************************** */

var numUsers = 0;

io.on('connection', function(socket)
{
    numUsers++;
    console.log(numUsers + " are now connected!");
    var addedUser = false;

    socket.on('chat message', function(msg)
    {
      io.emit('chat message', msg);
    })

    socket.on('set username', function(username)
    {
      console.log("New user named " + username); 
      addedUser = true;
      socket.username = username;
    })

    socket.on('video time', function(data)
    {
      io.emit('video time', data);
    })

    socket.on('pause', function(username)
    {
      io.emit('chat message', username + " has paused the video");
      io.emit('pause');
    })

    socket.on('disconnect', () =>
    {
      if(addedUser)
      {
        numUsers--;
        var message = socket.username + " disconnected. " + numUsers + " left in the server";
        console.log(message);
        io.emit('disconnected', message);
      }
    })
})