//moduels: startserver, User with constructor, socketpool, events, parseBuffer
//modules for commands  under actions, a module for each command
//server listeners would go in app.js along with startserver, dispatch action, handle connection, server.on
//use requireDir() node helper to require directories

'use strict';
const COMMAND_SYMBOL = '@';
const EventEmitter = require('events');
const net = require('net');


const uuid = require('uuid/v4');

const port = process.env.PORT || 3000;
console.log(`listening on port ${port}`);
const server = net.createServer();
const events = new EventEmitter();
const userPool = {};

let User = function (socket) {
  let id = uuid(); // QUESTION: I am getting confused with ID and how it is passed- sometimes user.id
  this.id = id;
  this.nickname = `User-${id}`;
  this.socket = socket;
};

// console.log();

server.on('connection', (socket) => {
  let user = new User(socket);
  userPool[user.id] = user; //QUESTION: is this a different user only in this code block???

  console.log('above event listener');
  socket.on('data', (buffer) => {
    dispatchAction(user, buffer);
  });
});

let dispatchAction = (user, buffer) => {
  let message = parse(buffer);
  message && events.emit(message.command, user.id, message);
};

/* on events */
/* code for on event listener for @all */
events.on('@all', (senderId, message) => {
  for (let userId in userPool) {
    let user = userPool[userId];
    user.socket.write(`<${senderId}>: ${message.payload}\n`);
  }
});

/* code for on event listener for @list command  */
events.on('@list', (senderId) => {
  let user = userPool[senderId];
  for (let userId in userPool) {
    user.socket.write(`<${userPool[userId].nickname}>\n`);
  }
});

/* code for on event listener for @nickname */
//change name to nickname with @nickname <new-name> 
/* //QUESTION: after I change the nickname, it carries through to the quit command, but not the all conmand(which still lists my userid string), why? */
events.on('@nickname', (senderId, message) => {
  let user = userPool[senderId];
  user.nickname = message.payload;
  user.socket.write(`<Your new username is ${user.nickname}>.\n`);
});

/* code to allow user to quit  */
events.on('@quit', (senderId) => {
  let user = userPool[senderId];
  user.socket.write(`Adios ${user.nickname}`);
  user.socket.destroy();
  user.socket.emit('close');
});

/* code to allow user to send direct message */
events.on('@dm', (senderId, message, ) => {
  let user = userPool[senderId].nickname;
  let receiverId = message.payload.match(/[^\s]+/)[0];

  for (let userId in userPool) {
    if (userPool[userId].nickname === receiverId) {
      let user = userPool[userId];
      user.socket.write(`<${user}> ${message.payload.match(/[\s].*/gm)}\n`);
    }
  }
});

/* code to parse the messages */
let parse = (buffer) => {
  let text = buffer.toString().trim();
  if (!text.startsWith(COMMAND_SYMBOL)) { return null; }
  if (text.startsWith(`${COMMAND_SYMBOL}`)) {
    let [command, payload] = text.split(/\s+(.*)/);
    console.log(`im here: ${command}`);
    return { command, payload };
  }
};


server.listen(port, () => {
  console.log(`Chat server running on port ${port}`);
});