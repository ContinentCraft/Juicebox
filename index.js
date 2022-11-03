const express = require('express');
const server = express();

const { client } = require('./db');
client.connect();

const PORT = 3000;

const apiRouter = require('./api');
server.use('/api', apiRouter);

server.listen(PORT, () => {
  console.log('The server is up on port', PORT)
});

const morgan = require('morgan');
server.use(morgan('dev'));

server.use(express.json())

server.use((req, res, next) => {
  console.log("<____Body Logger START____>");
  console.log(req.body);
  console.log("<_____Body Logger END_____>");

  next();
});

server.post('/api/users/register', () => {});
server.post('/api/users/login', () => {});
server.delete('/api/users/:id', () => {});