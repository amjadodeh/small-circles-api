const FriendRequestsService = {
  getAllFriendRequests(knex) {
    return knex.select('*').from('friend_requests');
  },

  insertFriendRequest(knex, newFriendRequest) {
    return knex
      .insert(newFriendRequest)
      .into('friend_requests')
      .returning('*')
      .then((rows) => {
        return rows[0];
      });
  },

  getById(knex, id) {
    return knex.from('friend_requests').select('*').where('id', id).first();
  },

  deleteFriendRequest(knex, id) {
    return knex('friend_requests').where({ id }).delete();
  },

  updateFriendRequest(knex, id, newFriendRequestFields) {
    return knex('friend_requests').where({ id }).update(newFriendRequestFields);
  },
};

module.exports = FriendRequestsService;
