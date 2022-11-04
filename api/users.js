const express = require('express');
const usersRouter = express.Router();

const jwt = require('jsonwebtoken')
const token = jwt.sign({ id: 1, username: 'albert' }, process.env.JWT_SECRET)
token;
const recoveredData = jwt.verify(token, process.env.JWT_SECRET)
recoveredData;
jwt.verify(token, process.env.JWT_SECRET)

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next(); // THIS IS DIFFERENT
});

const { getAllUsers } = require('../db');

usersRouter.get('/', async (req, res) => {
  const users = await getAllUsers();

  res.send({
    users: []
  });
});

usersRouter.get('/login', async (req, res, next) =>{
  console.log(req.body)
  res.send()
})

// usersRouter.post('/login', async (req, res, next) => {
//   console.log(req.body)
//   res.end()
// });

const { getUserByUsername } = require('../db');

usersRouter.post('/login', async (req, res, next) => {
  console.log(req.body)
  const { username, password } = req.body

  // request must have both
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password"
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      // create token & return to user
      res.send({ message: "you're logged in!" });
    } else {
      next({ 
        name: 'IncorrectCredentialsError', 
        message: 'Username or password is incorrect'
      });
    }
  } catch(error) {
    console.log(error);
    next(error);
  }
});

module.exports = usersRouter;