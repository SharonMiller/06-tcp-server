//moduels: startserver, User with constructor, socketpool, events, parseBuffer
//modules for commands  under actions, a module for each command
//server listeners would go in app.js along with startserver, dispatch action, handle connection, server.on
//use requireDir() node helper to require directires

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
  });//this would go in app.js
});

let dispatchAction = (user, buffer) => {
  let message = parse(buffer);
  events.emit(message.command, user.id, message);  
  console.log(message);
}; //this would go in app.js

events.on('@all', (senderId, message) => {
  for (let userId in userPool) { //this is a different userId - The for/in statement loops through the properties of an object. The block of code inside the loop will be executed once for each property.
    let user = userPool[userId];
    user.socket.write(`<${senderId}>: ${message.payload}\n`);
  } 
});
//code for on event listener for @list command 
events.on('@list', (senderId) => { //why is message not uuid
  let user = userPool[senderId];
  // console.log(sender);
  console.log(user);
  for (let userId in userPool) {
    user.socket.write(`<${userPool[userId].nickname}>\n`);
  }
});

//change name to nickname with @nickname <new-name>
events.on('@nickname', (senderId, message) => {
  let user = userPool[senderId];
  console.log('my nickname:', message.payload);
  console.log(userPool[senderId]);
  user.nickname = message.payload;
  // console.log(user.nickname);
  user.socket.write(`<Your new username is ${user.nickname}>.\n`);
});



let parse = (buffer) => {
  console.log('Im in parse');
  let text = buffer.toString().trim();
  if (!text.startsWith(COMMAND_SYMBOL)) { return null; }
  if (text.startsWith(`${COMMAND_SYMBOL}`)) {
    let [command, payload] = text.split(/\s+(.*)/);
    console.log(`im here: ${command}`);
    return { command, payload };
  }
  //   if (text.startsWith(`${COMMAND_SYMBOL}list`)) {
  //     let [command, payload] = text.split(/\s+(.*)/);
  //     console.log('this is the list');
  //     // return ;
  //   }
};


server.listen(port, () => {
  console.log(`Chat server running on port ${port}`);
});