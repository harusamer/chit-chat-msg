const path = require('path');
const http = require('http');
const cors = require('cors');
const express = require('express');
const socketio = require('socket.io');
const fs = require('fs');
const formatMessage = require('./helpers/formatDate')
const {
  getActiveUser,
  exitRoom,
  newUser,
  getIndividualRoomUsers
} = require('./helpers/userHelper');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: {
    origin: 'http://172.20.10.10:5173',
    methods: ['GET', 'POST']
}});

app.use(cors())
// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// this block will run when the client connects
io.on('connection', socket => {
  var count = 1;
  socket.on('joinRoom', ({ username, room }) => {
    console.log(username);
    console.log(room);
    const user = newUser(socket.id, username, room);

    socket.join(user.room);

    // General welcome
    socket.emit('message', formatMessage("", 'Messages are limited to this room! '));

    // Broadcast everytime users connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage("", `${user.username} has joined the room`)
      );

    // Current active users and room name
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getIndividualRoomUsers(user.room)
    });
  });
  // Listen for client message
  socket.on('chatMessage', msg => {
    const user = getActiveUser(socket.id); if (!user.room) { console.log("No Romm! 1"); return; }
    /*
    console.log('chatMessage', user)
    fs.appendFile('../hackathon-season2/msgs/text02', msg + "\n", err => {
      if (err) { console.error(err); }
    });
    fs.readFile('../hackathon-season2/msgs/text02', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      io.to(user.room).emit('message', formatMessage(user.username, data.split('\n')));
    });
    */
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });
  socket.on('chatImage', msg => {
    const user = getActiveUser(socket.id); if (!user.room) { console.log("No Romm! 2"); return; }
    console.log(`chatImage ${count}`);
    fs.writeFile(`../hackathon-season2/imgs/img${count++}.png`, msg.replace("data:image/png;base64,", ""), 'base64', err => {
      if (err) {
        console.error(err);
      }
    });
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  })
  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = exitRoom(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage("", `${user.username} has left the room`)
      );

      // Current active users and room name
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getIndividualRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

const mem = { "users": [], "rooms": [{"name":"dummy-room","users":[] }]}

app.get('/create-user', (req, res) => {
  console.log(req.query.name);
  mem["users"].push(req.query.name) 
  res.send(req.query.name)
})

app.get('/create-room', (req, res) => {
  console.log(req.params)
  mem["rooms"].push({
    "name": req.query.name,
    "users": [req.query.user]
  }) 
  res.send(mem);
})

app.get('/user-list', (req, res) => {
  console.log(req.params)
  res.send(mem);
})

// app.listen(3001, () => {
//   console.log(`Example app listening on port ${PORT}`)
// })

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

