const express = require('express');
const tagsRouter = express.Router();

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /tags");

  next(); // THIS IS DIFFERENT
});

const { getAllTags } = require('../db');

tagsRouter.get('/', async (req, res) => {
  const posts = await getAllTags();

  res.send({
    tags: []
  });
});

module.exports = tagsRouter;




tagsRouter.get('/:tagName/posts', async (req, res, next) => {
  // read the tagname from the params
  try {
    // use our method to get posts by tag name from the db
    // send out an object to the client { posts: // the posts }
  } catch ({ name, message }) {
    // forward the name and message to the error handler
  }
});