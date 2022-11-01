const express = require('express');
const usersRouter = express.Router();

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next(); // THIS IS DIFFERENT
});

usersRouter.get('/', (req, res) => {
  res.send({
    users: []
  });
});

module.exports = usersRouter;