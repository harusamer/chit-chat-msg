// helper/userHelper.js

const users = [];
const fs = require('fs');

const content = 'Some content!';

// Join user to chat
function newUser(id, username, room) {
  const user = { id, username, room };

  users.push(user);
  /*
  fs.writeFile(`../hackathon-season2/users/${username}.json`, content, err => {
    if (err) {
      console.error(err);
    }
  });
  */
  return user;
}

// Get current user
function getActiveUser(id) {
  console.log('getActiveUser', users)
  return users.find(user => user.id === id);
}

// User leaves chat
function exitRoom(id) {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getIndividualRoomUsers(room) {
  return users.filter(user => user.room === room);
}

module.exports = {
  newUser,
  getActiveUser,
  exitRoom,
  getIndividualRoomUsers
};