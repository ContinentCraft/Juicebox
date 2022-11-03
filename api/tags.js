const express = require('express');
const tagsRouter = express.Router();

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");

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