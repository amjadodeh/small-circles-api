# Small Circles API

Small Circles is a social platform focused on giving you control of your data.

This is the backend for Small Circles. The live app can be found at [https://small-circles-client.vercel.app](https://small-circles-client.vercel.app)

The front end client can be found at [https://github.com/amjadodeh/small-circles-client](https://github.com/amjadodeh/small-circles-client).

## Introduction

With Small Circles, your data is your data. With every post, you decide who can see your content. You can make a private post that only you can see, a post to be seen by all your friends, or select from your friend list to share to. You can even send direct messages to your friends!

## Documentation

### Endpoints

- `/users`
  - GET all users, returns an id, username, profile_picture, and friends for the each user
  - POST new user, request must contain username and password
- `/users/:userId`
  - All requests must contain a user id in place of ':userId'
  - GET user, returns users id, username, profile_picture, and friends
  - DELETE user, returns status code
  - PATCH user, request must contain either username, profile_picture, friends, or password
- `/users/login/:userId`
  - POST handles user verification for logging in
- `/posts`
  - GET all posts, returns an id, content, private, and user_id for the each
  - POST new post, request must contain content and user_id
- `/posts/:postId`
  - All requests contain a posts id in place of ':postId'
  - GET a post, returns posts id, content, private, and user_id
  - DELETE a post, returns status code
  - PATCH a post, request must contain either content or private
- `/friendRequests`
  - GET all friend requests, returns an id, from, to, and status for the each
  - POST new friend request, request must contain user_id_from and user_id_to
- `/friendRequests/:friendRequestId`
  - All requests contain a friend request id in place of ':friendRequestId'
  - GET a friend request, returns friend request id, from, to, and status
  - DELETE a friend request, returns status code
  - PATCH a friend request, request must contain request_status

## Technology

#### Back End

- Node and Express
  - RESTful Api
- Testing
  - Supertest (integration)
  - Mocha and Chai (unit)
- Database
  - Postgres
  - Knex.js - SQL query builder

#### Production

Deployed via Heroku

## Set up

Major dependencies for this repo include Postgres and Node.

To get setup locally, do the following:

1. Clone this repository to your machine, `cd` into the directory and run `npm install`

2. Create the small-circles and small-circles-test databases

3. Create a `.env` file in the project root

Inside these files you'll need the following:

```
NODE_ENV=development
PORT=8000
DATABASE_URL="postgresql://postgres@localhost/small-circles"
TEST_DATABASE_URL="postgresql://postgres@localhost/small-circles-test"
CLIENT_ORIGIN=<your-site-here>

```

4. Run the migrations for small-circles - `npm run migrate`

5. Run the migrations for small-circles-test - `npm run migrate:test`

6. Run the tests - `npm t`

7. Start the app - `npm run dev`
