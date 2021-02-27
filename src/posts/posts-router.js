const path = require('path');
const express = require('express');

const PostsService = require('./posts-service');

const postsRouter = express.Router();
const jsonParser = express.json();

const serializePost = (post) => ({
  id: Number(post.id),
  content: post.content,
  private: post.private,
  user_id: Number(post.user_id),
});

postsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    PostsService.getAllPosts(knexInstance)
      .then((posts) => {
        res.json(posts.map(serializePost));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { content, private, user_id } = req.body;
    const newPost = { content, ...(private && { private }), user_id };

    if (!content) {
      return res.status(400).json({
        error: { message: `Missing 'content' in request body` },
      });
    }

    if (!user_id) {
      return res.status(400).json({
        error: { message: `Missing 'user_id' in request body` },
      });
    }

    PostsService.insertPost(req.app.get('db'), newPost)
      .then((post) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${post.id}`))
          .json(serializePost(post));
      })
      .catch(next);
  });

postsRouter
  .route('/:postId')
  .all((req, res, next) => {
    PostsService.getById(req.app.get('db'), req.params.postId)
      .then((post) => {
        if (!post) {
          return res.status(404).json({
            error: { message: `Post doesn't exist` },
          });
        }
        res.post = post;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializePost(res.post));
  })
  .delete((req, res, next) => {
    PostsService.deletePost(req.app.get('db'), req.params.postId)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    // not yet implemented on client-side
    const { content, private } = req.body;
    const postToUpdate = { content, private };

    const numberOfValues = Object.values(postToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'content' or 'private'`,
        },
      });

    PostsService.updatePost(req.app.get('db'), req.params.postId, postToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = postsRouter;
