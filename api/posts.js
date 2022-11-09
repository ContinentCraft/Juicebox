const express = require('express');
const postsRouter = express.Router();


// - new
const { requireUser } = require('./utils');


postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = ""} = req.body;

  const tagArr = tags.trim().split(/\s+/)
  const postData = {};

// only send the tags if there are some to send

  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
      // add authorId, title, content to postData object
      // const post = await createPost(postData);
      // this will create the post and the tags for us
      // if the post comes back, res.send({ post });
      // otherwise, next an appropriate error object 
    } catch ({ name, message }) {
      next({ name, message });
    }
  });

  res.send({ message: 'under construction' });



postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");

  next(); // THIS IS DIFFERENT
});

const { getAllPosts } = require('../db');

postsRouter.get('/', async (req, res) => {
  const posts = await getAllPosts();

  res.send({
    posts: []
  });
});


// - new - one method changes many others

postsRouter.get('/', async (req, res, next) => {
  try {
    const allPosts = await getAllPosts();

    const posts = allPosts.filter(post => {
      // keep a post if it is either active, or if it belongs to the current user
    });

    res.send({
      posts
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});



const posts = allPosts.filter(post => {
  return post.active || (req.user && post.author.id === req.user.id);
});

//ln 87 + 71 come from 'One Method Changes Many Others'




// - new - this is the patch:
postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost })
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not yours'
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});


// - new
postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);

    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false });

      res.send({ post: updatedPost });
    } else {
      // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
      next(post ? { 
        name: "UnauthorizedUserError",
        message: "You cannot delete a post which is not yours"
      } : {
        name: "PostNotFoundError",
        message: "That post does not exist"
      });
    }

  } catch ({ name, message }) {
    next({ name, message })
  }
});




module.exports = postsRouter;