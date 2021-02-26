const path = require('path');
const express = require('express');
const bcrypt = require('bcryptjs');

const FriendRequestsService = require('./friendRequests-service');

const friendRequestsRouter = express.Router();
const jsonParser = express.json();

const serializeFriendRequest = (friendRequest) => ({
  from: Number(friendRequest.user_id_from),
  to: Number(friendRequest.user_id_to),
  status: friendRequest.request_status,
});

friendRequestsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    FriendRequestsService.getAllFriendRequests(knexInstance)
      .then((friendRequests) => {
        res.json(friendRequests.map(serializeFriendRequest));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { user_id_from, user_id_to } = req.body;

    if (!user_id_from) {
      return res.status(400).json({
        error: { message: `Missing 'user_id_from' in request body` },
      });
    }

    if (!user_id_to) {
      return res.status(400).json({
        error: { message: `Missing 'user_id_to' in request body` },
      });
    }

    const newFriendRequest = {
      user_id_from,
      user_id_to,
      request_status: 'Pending',
    };

    FriendRequestsService.insertFriendRequest(
      req.app.get('db'),
      newFriendRequest
    )
      .then((friendRequest) => {
        res.status(201).json(serializeFriendRequest(friendRequest));
      })
      .catch(next);
  });

friendRequestsRouter
  .route('/:friendRequestIds')
  .all((req, res, next) => {
    const user_id_from = Number(req.params.friendRequestIds.split('-')[0]);
    const user_id_to = Number(req.params.friendRequestIds.split('-')[1]);

    FriendRequestsService.getById(req.app.get('db'), user_id_from, user_id_to)
      .then((friendRequest) => {
        if (!friendRequest) {
          return res.status(404).json({
            error: { message: `Friend request doesn't exist` },
          });
        }
        res.user_id_from = user_id_from;
        res.user_id_to = user_id_to;
        res.friendRequest = friendRequest;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeFriendRequest(res.friendRequest));
  })
  .delete((req, res, next) => {
    FriendRequestsService.deleteFriendRequest(
      req.app.get('db'),
      res.user_id_from,
      res.user_id_to
    )
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { request_status } = req.body;
    const friendRequestToUpdate = { request_status };

    if (!request_status) {
      return res.status(400).json({
        error: {
          message: `Request body must contain 'request_status'`,
        },
      });
    }

    FriendRequestsService.updateFriendRequest(
      req.app.get('db'),
      res.user_id_from,
      res.user_id_to,
      friendRequestToUpdate
    )
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = friendRequestsRouter;
