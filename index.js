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
  let id = uuid();
  this.id = id;
  this.nickname = `User-${id}`;
  this.socket = socket;
};

// console.log();

server.on('connection', (socket) => {
  let user = new User(socket);
  userPool[user.id] = user;

  console.log('above event listener');
  socket.on('data', (buffer) => {
    dispatchAction(user.nickname, buffer);
  });
});

let dispatchAction = (userId, buffer) => {
  let message = parse(buffer);
  events.emit(message.command, userId, message);  
  console.log(message);
};

events.on('@all', (sender, message) => {
  for (let userId in userPool) { //this is a different userId - look up for in loop
    let user = userPool[userId];
    user.socket.write(`<${sender}>: ${message.payload}\n`);
  }
});
//code for on event listener for @list command 
events.on('@list', (sender, message) => { //why is message not ued
  let user = userPool[sender];
  for (let userId in userPool) {
    // console.log(userPool);
    user.socket.write(`<${userPool[userId]}>\n`);
  }
});

//change name to nickname with @nickname <new-name>
events.on('@nickname', (sender, message) => {
  let user = userPool[sender];
  console.log('my nickname:', message.payload);
  user.nickname = message.payload;
  console.log(user.nickname);
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