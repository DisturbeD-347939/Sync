var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var router = express.Router();
var path = require('path');
var admin = require('firebase-admin');
var bcrypt = require('bcryptjs')
var serviceAccount = require('./ServiceAccountKey.json');

admin.initializeApp(
{
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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
server.listen(5000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

/*************************************** IO **************************************************** */

//Counts the number of active users on the website
var numUsers = 0;

//Function called when a new member joins
io.on('connection', function(socket)
{
    numUsers++;
    console.log(numUsers + " are now connected!");
    var addedUser = false;
    var roomID = "";

    socket.on('chat message', function(msg)
    {
      io.to(roomID).emit('chat message', msg);
    })

    socket.on('setup', function(data)
    {
      console.log("New user named " + data["username"] + " on room " + data["id"]);

      socket.join(data["id"]);
      socket.username = data["username"];
      roomID = data["id"];

      addedUser = true;
    })

    socket.on('video time', function(data)
    {
      io.to(roomID).emit('video time', data);
    })

    socket.on('disconnect', () =>
    {
      if(addedUser)
      {
        numUsers--;
        var message = socket.username + " disconnected. " + numUsers + " left in the server";
        console.log(message);
        io.to(roomID).emit('disconnected', message);
      }
    })

    socket.on('video URL', function(videoID)
    {
      io.to(roomID).emit('video URL', videoID);
    })

    socket.on('state', function(data)
    {
      switch(data["state"])
      {
        case -1:
          console.log("Unstarted");
          io.to(roomID).emit('chat message', data["username"] + " is about to start the video");
          io.to(roomID).emit('unstarted');
          break;
        case 0:
          console.log("Ended");
          io.to(roomID).emit('chat message', data["username"] + " has finished the video");
          io.to(roomID).emit('end')
          break;
        case 1:
          console.log("Playing");
          io.to(roomID).emit('chat message', data["username"] + " has played the video");
          io.to(roomID).emit('play');
          break;
        case 2:
          console.log("Paused");
          io.to(roomID).emit('chat message', data["username"] + " has paused the video");
          io.to(roomID).emit('pause');
          break;
          
      }
    })

    socket.on('register', function(data)
    {
      socket.leaveAll();
      socket.join(data["email"]);
      var emailAvailable = true;
      var counter = 0;
      db.collection('Users').get()
      .then(snapshot => 
      {
        snapshot.forEach(doc => 
        {
          if(doc.id == data["email"])
          {
            console.log("Same email");
            emailAvailable = false;
          }
          counter++;

          if(counter == snapshot["_size"])
          {
            bcrypt.genSalt(10, function(err, salt)
            {
              bcrypt.hash(data["password"], salt, function(err, hash) 
              {
                var fields = 
                {
                  username: data["username"],
                  password: hash
                }
                if(emailAvailable)
                {
                  db.collection('Users').doc(data["email"]).set(fields).then(() =>
                  {
                    io.to(data["email"]).emit('register', true);
                    console.log("Account created");
                    socket.leaveAll();
                  })
                }
                else
                {
                  io.to(data["email"]).emit('register', false);
                  console.log("Email in use");
                  socket.leaveAll();
                }
              });
            });
          }
        })
      })
      .catch(err => 
      {
        console.log('Error getting documents', err);
        io.to(data["email"].emit('register', "error"))
      });
      
    })

    socket.on('login', function(data)
    {
      console.log(data);
      socket.leaveAll();
      socket.join(data["email"]);
      db.collection('Users').doc(data["email"]).get()
      .then(function(doc) 
      {
        if (doc.exists) 
        {
          bcrypt.compare(data["password"], doc.data()["password"], function(err, res) 
          {
            if(res == true)
            {
              console.log("Logged in");
              io.to(data["email"]).emit('login', {login: true, email: data["email"], username: doc.data()["username"]});
            }
            else
            {
              console.log("Wrong email/password");
              io.to(data["email"]).emit('login', {login: false})
            }
          });
        } 
        else 
        {
            console.log("No such document!");
            io.to(data["email"]).emit('login', {login: false})
        }
      })
    })

})

/*

          */