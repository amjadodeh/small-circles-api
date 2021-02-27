const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeUsersArray } = require('./users.fixtures');
const { makeFriendRequestsArray } = require('./friendRequests.fixtures');

let db;

before('make knex instance', () => {
  db = knex({
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL,
  });
  app.set('db', db);
});

before('clean the table', () => db('friend_requests').truncate());
afterEach('cleanup', () => db('friend_requests').truncate());

after('disconnect from db', () => db.destroy());

describe(`GET /api/friendRequests`, () => {
  context(`Given no friendRequests`, () => {
    it(`responds with 200 and an empty list`, () => {
      return supertest(app).get('/api/friendRequests').expect(200, []);
    });
  });

  context('Given there are friendRequests in the database', () => {
    const testFriendRequests = makeFriendRequestsArray();

    beforeEach('insert friendRequests', () => {
      return db
        .into('users')
        .insert(makeUsersArray())
        .then(() => {
          return db.into('friend_requests').insert(testFriendRequests);
        });
    });

    it('responds with 200 and all of the friendRequests', () => {
      return supertest(app)
        .get('/api/friendRequests')
        .expect(200, [
          {
            id: 1,
            from: 2,
            to: 4,
            status: 'Pending',
          },
          {
            id: 2,
            from: 4,
            to: 1,
            status: 'Pending',
          },
        ]);
    });
  });
});

describe(`GET /api/friendRequests/:friendRequest_id`, () => {
  context(`Given no friendRequests`, () => {
    it(`responds with 404`, () => {
      const friendRequestId = 1234;
      return supertest(app)
        .get(`/api/friendRequests/${friendRequestId}`)
        .expect(404, { error: { message: `Friend request doesn't exist` } });
    });
  });

  context('Given there are friendRequests in the database', () => {
    const testFriendRequests = makeFriendRequestsArray();

    beforeEach('insert friendRequests', () => {
      return db
        .into('users')
        .insert(makeUsersArray())
        .then(() => {
          return db.into('friend_requests').insert(testFriendRequests);
        });
    });

    it('responds with 200 and the specified friendRequest', () => {
      const friendRequestId = 2;
      const expectedFriendRequest = {
        id: 2,
        from: 4,
        to: 1,
        status: 'Pending',
      };
      return supertest(app)
        .get(`/api/friendRequests/${friendRequestId}`)
        .expect(200, expectedFriendRequest);
    });
  });
});

describe(`POST /api/friendRequests`, () => {
  const { testFriendRequests } = makeFriendRequestsArray();

  beforeEach('insert friendRequests', () => {
    return db
      .into('users')
      .insert(makeUsersArray())
      .then(() => {
        return db.into('friend_requests').insert(testFriendRequests);
      });
  });

  it(`creates an friendRequest, responding with 201 and the new friendRequest`, () => {
    const newFriendRequest = {
      user_id_from: 3,
      user_id_to: 2,
    };

    return supertest(app)
      .post('/api/friendRequests')
      .send(newFriendRequest)
      .expect(201)
      .expect((res) => {
        expect(res.body.from).to.eql(newFriendRequest.user_id_from);
        expect(res.body.to).to.eql(newFriendRequest.user_id_to);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('status');
      })
      .then((friendRequestRes) =>
        supertest(app)
          .get(`/api/friendRequests/${friendRequestRes.body.id}`)
          .expect(friendRequestRes.body)
      );
  });

  const requiredFields = ['user_id_from', 'user_id_to'];

  requiredFields.forEach((field) => {
    const newFriendRequest = {
      user_id_from: 3,
      user_id_to: 2,
    };

    it(`responds with 400 and an error message when the '${field}' is missing`, () => {
      delete newFriendRequest[field];

      return supertest(app)
        .post('/api/friendRequests')
        .send(newFriendRequest)
        .expect(400, {
          error: { message: `Missing '${field}' in request body` },
        });
    });
  });
});

describe(`PATCH /api/friendRequests/:friendRequest_id`, () => {
  context(`Given no friendRequests`, () => {
    it(`responds with 404`, () => {
      const friendRequestId = 1234;
      return supertest(app)
        .patch(`/api/friendRequests/${friendRequestId}`)
        .expect(404, { error: { message: `Friend request doesn't exist` } });
    });
  });

  context('Given there are friendRequests in the database', () => {
    const testFriendRequests = makeFriendRequestsArray();

    beforeEach('insert friendRequests', () => {
      return db
        .into('users')
        .insert(makeUsersArray())
        .then(() => {
          return db.into('friend_requests').insert(testFriendRequests);
        });
    });

    it(`responds with 400 when no required fields supplied`, () => {
      const idToUpdate = 2;
      return supertest(app)
        .patch(`/api/friendRequests/${idToUpdate}`)
        .send({ irrelevantField: 'foo' })
        .expect(400, {
          error: {
            message: `Request body must contain 'request_status'`,
          },
        });
    });

    it(`responds with 204 when updating only a subset of fields`, () => {
      const idToUpdate = 2;
      const updateFriendRequest = {
        request_status: 'Accepted',
      };
      const expectedFriendRequest = {
        id: 2,
        from: 4,
        to: 1,
        status: 'Accepted',
      };

      return supertest(app)
        .patch(`/api/friendRequests/${idToUpdate}`)
        .send({
          ...updateFriendRequest,
          fieldToIgnore: 'should not be in GET response',
        })
        .expect(204)
        .then((res) =>
          supertest(app)
            .get(`/api/friendRequests/${idToUpdate}`)
            .expect(expectedFriendRequest)
        );
    });
  });
});

describe(`DELETE /api/friendRequests/:friendRequest_id`, () => {
  context(`Given no friendRequests`, () => {
    it(`responds with 404`, () => {
      const friendRequestId = 1234;
      return supertest(app)
        .delete(`/api/friendRequests/${friendRequestId}`)
        .expect(404, { error: { message: `Friend request doesn't exist` } });
    });
  });

  context('Given there are friendRequests in the database', () => {
    const testFriendRequests = makeFriendRequestsArray();

    beforeEach('insert friendRequests', () => {
      return db
        .into('users')
        .insert(makeUsersArray())
        .then(() => {
          return db.into('friend_requests').insert(testFriendRequests);
        });
    });

    it('responds with 204 and removes the friendRequest', () => {
      const idToRemove = 2;
      const expectedFriendRequests = [
        {
          id: 1,
          from: 2,
          to: 4,
          status: 'Pending',
        },
      ];

      return supertest(app)
        .delete(`/api/friendRequests/${idToRemove}`)
        .expect(204)
        .then((res) =>
          supertest(app)
            .get(`/api/friendRequests`)
            .expect(expectedFriendRequests)
        );
    });
  });
});
