const path = require('path');
const express = require('express');
const bcrypt = require('bcryptjs');

const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonParser = express.json();

const serializeUser = (user) => ({
  id: Number(user.id),
  username: user.username,
  profile_picture: user.profile_picture,
  friends: user.friends,
});

usersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    UsersService.getAllUsers(knexInstance)
      .then((users) => {
        res.json(users.map(serializeUser));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { username, password } = req.body;

    if (!username) {
      return res.status(400).json({
        error: { message: `Missing 'username' in request body` },
      });
    }

    if (!password) {
      return res.status(400).json({
        error: { message: `Missing 'password' in request body` },
      });
    }

    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return res.status(500).json({
          error: { message: err },
        });
      }
      bcrypt.hash(password, salt, function (err, hash) {
        if (err) {
          return res.status(500).json({
            error: { message: err },
          });
        }
        const newUser = { username, hash };

        UsersService.insertUser(req.app.get('db'), newUser)
          .then((user) => {
            res
              .status(201)
              .location(path.posix.join(req.originalUrl, `/${user.id}`))
              .json(serializeUser(user));
          })
          .catch(next);
      });
    });
  });

usersRouter.route('/login/:userId').post(jsonParser, (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      error: { message: `Missing 'password' in request body` },
    });
  }

  UsersService.getById(req.app.get('db'), req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          error: { message: `User doesn't exist` },
        });
      }
      bcrypt.compare(password, user.hash, function (err, passwordCorrect) {
        if (passwordCorrect === true) {
          return res.status(200).json(true).end();
        } else if (!passwordCorrect) {
          return res.status(403).json(false).end();
        }
      });
    })
    .catch(next);
});

usersRouter
  .route('/:userId')
  .all((req, res, next) => {
    UsersService.getById(req.app.get('db'), req.params.userId)
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            error: { message: `User doesn't exist` },
          });
        }
        res.user = user;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeUser(res.user));
  })
  .delete((req, res, next) => {
    UsersService.deleteUser(req.app.get('db'), req.params.userId)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    // not yet fully implemented on client-side
    const { username, profile_picture, friends, password } = req.body;
    const userToUpdate = { username, profile_picture, friends, password };

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
    if (numberOfValues === 0 && friends !== '') {
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'username', 'profile_picture', 'friends', or 'password'`,
        },
      });
    }

    if (userToUpdate.friends === '') {
      userToUpdate.friends = null;
    }

    UsersService.updateUser(req.app.get('db'), req.params.userId, userToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = usersRouter;
