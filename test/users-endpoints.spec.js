const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeUsersArray } = require('./users.fixtures');

let db;

before('make knex instance', () => {
  db = knex({
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL,
  });
  app.set('db', db);
});

before('clean the table', () =>
  db.raw('TRUNCATE posts, users RESTART IDENTITY CASCADE')
);
afterEach('cleanup', () =>
  db.raw('TRUNCATE posts, users RESTART IDENTITY CASCADE')
);

after('disconnect from db', () => db.destroy());

describe(`GET /api/users`, () => {
  context(`Given no users`, () => {
    it(`responds with 200 and an empty list`, () => {
      return supertest(app).get('/api/users').expect(200, []);
    });
  });

  context('Given there are users in the database', () => {
    const testUsers = makeUsersArray();

    const expected = [
      {
        id: 1,
        username: 'User1',
        profile_picture:
          'https://images.pexels.com/photos/772478/pexels-photo-772478.jpeg',
        friends: '2,3',
      },
      {
        id: 2,
        username: 'User2',
        profile_picture:
          'https://images.pexels.com/photos/772478/pexels-photo-772478.jpeg',
        friends: '1,3',
      },
      {
        id: 3,
        username: 'User3',
        profile_picture:
          'https://images.pexels.com/photos/772478/pexels-photo-772478.jpeg',
        friends: '1,2',
      },
      {
        id: 4,
        username: 'User4',
        profile_picture:
          'https://images.pexels.com/photos/772478/pexels-photo-772478.jpeg',
        friends: null,
      },
    ];

    beforeEach('insert users', () => {
      return db.into('users').insert(testUsers);
    });

    it('responds with 200 and all of the users', () => {
      return supertest(app).get('/api/users').expect(200, expected);
    });
  });
});

describe(`GET /api/users/:userId`, () => {
  context(`Given no users`, () => {
    it(`responds with 404`, () => {
      const userId = 123456;
      return supertest(app)
        .get(`/api/users/${userId}`)
        .expect(404, { error: { message: `User doesn't exist` } });
    });
  });

  context('Given there are users in the database', () => {
    const testUsers = makeUsersArray();

    beforeEach('insert users', () => {
      return db.into('users').insert(testUsers);
    });

    it('responds with 200 and the specified user', () => {
      const userId = 2;
      const expectedUser = {
        id: 2,
        username: 'User2',
        profile_picture:
          'https://images.pexels.com/photos/772478/pexels-photo-772478.jpeg',
        friends: '1,3',
      };
      return supertest(app)
        .get(`/api/users/${userId}`)
        .expect(200, expectedUser);
    });
  });
});

describe(`POST /api/users`, () => {
  const testUsers = makeUsersArray();

  beforeEach('insert users', () => {
    return db.into('users').insert(testUsers);
  });

  it(`creates an user, responding with 201 and the new user`, () => {
    const newUser = {
      username: 'kuygu7',
      password: 'sfsfsfsf',
    };

    return supertest(app)
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.username).to.eql(newUser.username);
        expect(res.body).to.have.property('id');
        expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
      })
      .then((postRes) =>
        supertest(app).get(`/api/users/${postRes.body.id}`).expect(postRes.body)
      );
  });

  const requiredFields = ['username', 'password'];

  requiredFields.forEach((field) => {
    const newUser = {
      username: 'My Nawmesifn',
      password: 'Listicles',
    };

    it(`responds with 400 and an error message when the '${field}' is missing`, () => {
      delete newUser[field];

      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(400, {
          error: { message: `Missing '${field}' in request body` },
        });
    });
  });
});

describe(`POST /api/users/login/:userId`, () => {
  context(`Given no users`, () => {
    it(`responds with 404`, () => {
      const userId = 9999999999;
      return supertest(app)
        .post(`/api/users/login/${userId}`)
        .send({ password: 'foo' })
        .expect(404, { error: { message: `User doesn't exist` } });
    });
  });

  context('Given there are users in the database', () => {
    const testUsers = makeUsersArray();

    beforeEach('insert users', () => {
      return db.into('users').insert(testUsers);
    });

    it(`responds with 200 if password is correct`, () => {
      const userId = 1;
      return supertest(app)
        .post(`/api/users/login/${userId}`)
        .send({ password: 'Pass1' })
        .expect(200);
    });

    it(`responds with 403 if password is incorrect`, () => {
      const userId = 1;
      return supertest(app)
        .post(`/api/users/login/${userId}`)
        .send({ password: 'password???' })
        .expect(403);
    });

    it(`responds with 400 when no password supplied`, () => {
      const userId = 1;
      return supertest(app)
        .post(`/api/users/login/${userId}`)
        .send({ irrelevantField: 'foo' })
        .expect(400, {
          error: { message: `Missing 'password' in request body` },
        });
    });
  });
});

describe(`PATCH /api/users/:userId`, () => {
  context(`Given no users`, () => {
    it(`responds with 404`, () => {
      const userId = 123456;
      return supertest(app)
        .patch(`/api/users/${userId}`)
        .expect(404, { error: { message: `User doesn't exist` } });
    });
  });

  context('Given there are users in the database', () => {
    const testUsers = makeUsersArray();

    beforeEach('insert users', () => {
      return db.into('users').insert(testUsers);
    });

    it('responds with 204 and updates the user', () => {
      const idToUpdate = 2;
      const updateUser = {
        id: 2,
        username: 'UpdatedUser2',
        profile_picture:
          'https://images.pexels.com/photos/1887946/pexels-photo-1887946.jpeg',
        friends: '1,3',
      };
      return supertest(app)
        .patch(`/api/users/${idToUpdate}`)
        .send(updateUser)
        .expect(204)
        .then((res) =>
          supertest(app).get(`/api/users/${idToUpdate}`).expect(updateUser)
        );
    });

    it(`responds with 400 when no required fields supplied`, () => {
      const idToUpdate = 2;
      return supertest(app)
        .patch(`/api/users/${idToUpdate}`)
        .send({ irrelevantField: 'foo' })
        .expect(400, {
          error: {
            message: `Request body must contain either 'username', 'profile_picture', 'friends', or 'password'`,
          },
        });
    });

    it(`responds with 204 when updating only a subset of fields`, () => {
      const idToUpdate = 2;
      const updateUser = {
        username: 'UpdatedUser2',
      };
      const expectedUser = {
        id: 2,
        username: 'UpdatedUser2',
        profile_picture:
          'https://images.pexels.com/photos/772478/pexels-photo-772478.jpeg',
        friends: '1,3',
      };

      return supertest(app)
        .patch(`/api/users/${idToUpdate}`)
        .send({
          ...updateUser,
          fieldToIgnore: 'should not be in GET response',
        })
        .expect(204)
        .then((res) =>
          supertest(app).get(`/api/users/${idToUpdate}`).expect(expectedUser)
        );
    });
  });
});

describe(`DELETE /api/users/:userId`, () => {
  context(`Given no users`, () => {
    it(`responds with 404`, () => {
      const userId = 123456;
      return supertest(app)
        .delete(`/api/users/${userId}`)
        .expect(404, { error: { message: `User doesn't exist` } });
    });
  });

  context('Given there are users in the database', () => {
    const testUsers = makeUsersArray();

    beforeEach('insert users', () => {
      return db.into('users').insert(testUsers);
    });

    it('responds with 204 and removes the user', () => {
      const idToRemove = 2;
      const expectedUsers = [
        {
          id: 1,
          username: 'User1',
          profile_picture:
            'https://images.pexels.com/photos/772478/pexels-photo-772478.jpeg',
          friends: '2,3',
        },
        {
          id: 3,
          username: 'User3',
          profile_picture:
            'https://images.pexels.com/photos/772478/pexels-photo-772478.jpeg',
          friends: '1,2',
        },
        {
          id: 4,
          username: 'User4',
          profile_picture:
            'https://images.pexels.com/photos/772478/pexels-photo-772478.jpeg',
          friends: null,
        },
      ];
      return supertest(app)
        .delete(`/api/users/${idToRemove}`)
        .expect(204)
        .then((res) => supertest(app).get(`/api/users`).expect(expectedUsers));
    });
  });
});
