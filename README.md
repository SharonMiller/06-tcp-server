### TCP Chat Server

# Installation
- While in terminal, navigate to the project root directory
- Run `node index.js`
- Open a second terminal and run `nc localhost 3000`
- Open a third terminal and run `nc localhost 3000`

# Chat Commands
- `@all <message>` will send message to all users
- `@quit` will quit the chat program and end your session
- `@list` will list all current users
- `@dm <username> <message>` will send a message directly to the user