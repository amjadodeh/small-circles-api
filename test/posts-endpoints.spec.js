const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeUsersArray } = require('./users.fixtures');
const { makePostsArray } = require('./posts.fixtures');

let db;

before('make knex instance', () => {
  db = knex({
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL,
  });
  app.set('db', db);
});

before('clean the table', () => db('posts').truncate());
afterEach('cleanup', () => db('posts').truncate());

after('disconnect from db', () => db.destroy());

describe(`GET /api/posts`, () => {
  context(`Given no posts`, () => {
    it(`responds with 200 and an empty list`, () => {
      return supertest(app).get('/api/posts').expect(200, []);
    });
  });

  context('Given there are posts in the database', () => {
    const { testPosts, testPostsInDatabase } = makePostsArray();

    beforeEach('insert posts', () => {
      return db
        .into('users')
        .insert(makeUsersArray())
        .then(() => {
          return db.into('posts').insert(testPosts);
        });
    });

    it('responds with 200 and all of the posts', () => {
      return supertest(app).get('/api/posts').expect(200, testPostsInDatabase);
    });
  });
});

describe(`GET /api/posts/:post_id`, () => {
  context(`Given no posts`, () => {
    it(`responds with 404`, () => {
      const postId = 123456;
      return supertest(app)
        .get(`/api/posts/${postId}`)
        .expect(404, { error: { message: `Post doesn't exist` } });
    });
  });

  context('Given there are posts in the database', () => {
    const { testPosts } = makePostsArray();

    beforeEach('insert posts', () => {
      return db
        .into('users')
        .insert(makeUsersArray())
        .then(() => {
          return db.into('posts').insert(testPosts);
        });
    });

    it('responds with 200 and the specified post', () => {
      const postId = 2;
      const expectedPost = {
        id: 2,
        content: 'Hello from Post 2!',
        private: null,
        user_id: 1,
      };
      return supertest(app)
        .get(`/api/posts/${postId}`)
        .expect(200, expectedPost);
    });
  });
});

describe(`POST /api/posts`, () => {
  const { testPosts } = makePostsArray();

  beforeEach('insert posts', () => {
    return db
      .into('users')
      .insert(makeUsersArray())
      .then(() => {
        return db.into('posts').insert(testPosts);
      });
  });

  it(`creates an post, responding with 201 and the new post`, () => {
    const newPost = {
      content: 'Hello from a new post!',
      user_id: 1,
    };

    return supertest(app)
      .post('/api/posts')
      .send(newPost)
      .expect(201)
      .expect((res) => {
        expect(res.body.content).to.eql(newPost.content);
        expect(res.body.user_id).to.eql(newPost.user_id);
        expect(res.body).to.have.property('id');
        expect(res.headers.location).to.eql(`/api/posts/${res.body.id}`);
      })
      .then((postRes) =>
        supertest(app).get(`/api/posts/${postRes.body.id}`).expect(postRes.body)
      );
  });

  const requiredFields = ['content', 'user_id'];

  requiredFields.forEach((field) => {
    const newPost = {
      content: 'New Post',
      user_id: 1,
    };

    it(`responds with 400 and an error message when the '${field}' is missing`, () => {
      delete newPost[field];

      return supertest(app)
        .post('/api/posts')
        .send(newPost)
        .expect(400, {
          error: { message: `Missing '${field}' in request body` },
        });
    });
  });
});

describe(`PATCH /api/posts/:post_id`, () => {
  context(`Given no posts`, () => {
    it(`responds with 404`, () => {
      const postId = 123456;
      return supertest(app)
        .patch(`/api/posts/${postId}`)
        .expect(404, { error: { message: `Post doesn't exist` } });
    });
  });

  context('Given there are posts in the database', () => {
    const { testPosts } = makePostsArray();

    beforeEach('insert posts', () => {
      return db
        .into('users')
        .insert(makeUsersArray())
        .then(() => {
          return db.into('posts').insert(testPosts);
        });
    });

    it('responds with 204 and updates the post', () => {
      const idToUpdate = 2;
      const updatePost = {
        content: 'Hello from an updated Post 2!',
        private: null,
        user_id: 1,
      };
      const expectedPost = {
        id: 2,
        content: 'Hello from an updated Post 2!',
        private: null,
        user_id: 1,
      };

      return supertest(app)
        .patch(`/api/posts/${idToUpdate}`)
        .send(updatePost)
        .expect(204)
        .then((res) =>
          supertest(app).get(`/api/posts/${idToUpdate}`).expect(expectedPost)
        );
    });

    it(`responds with 400 when no required fields supplied`, () => {
      const idToUpdate = 2;
      return supertest(app)
        .patch(`/api/posts/${idToUpdate}`)
        .send({ irrelevantField: 'foo' })
        .expect(400, {
          error: {
            message: `Request body must contain either 'content' or 'private'`,
          },
        });
    });

    it(`responds with 204 when updating only a subset of fields`, () => {
      const idToUpdate = 2;
      const updatePost = {
        content: 'Hello from an updated Post 2!',
      };
      const expectedPost = {
        id: 2,
        content: 'Hello from an updated Post 2!',
        private: null,
        user_id: 1,
      };

      return supertest(app)
        .patch(`/api/posts/${idToUpdate}`)
        .send({
          ...updatePost,
          fieldToIgnore: 'should not be in GET response',
        })
        .expect(204)
        .then((res) =>
          supertest(app).get(`/api/posts/${idToUpdate}`).expect(expectedPost)
        );
    });
  });
});

describe(`DELETE /api/posts/:post_id`, () => {
  context(`Given no posts`, () => {
    it(`responds with 404`, () => {
      const postId = 123456;
      return supertest(app)
        .delete(`/api/posts/${postId}`)
        .expect(404, { error: { message: `Post doesn't exist` } });
    });
  });

  context('Given there are posts in the database', () => {
    const { testPosts, testPostsInDatabase } = makePostsArray();

    beforeEach('insert posts', () => {
      return db
        .into('users')
        .insert(makeUsersArray())
        .then(() => {
          return db.into('posts').insert(testPosts);
        });
    });

    it('responds with 204 and removes the post', () => {
      const idToRemove = 2;
      const expectedPosts = testPostsInDatabase.filter(
        (post) => post.id !== idToRemove
      );

      return supertest(app)
        .delete(`/api/posts/${idToRemove}`)
        .expect(204)
        .then((res) => supertest(app).get(`/api/posts`).expect(expectedPosts));
    });
  });
});
