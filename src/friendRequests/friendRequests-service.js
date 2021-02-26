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

  getById(knex, user_id_from, user_id_to) {
    return knex
      .from('friend_requests')
      .select('*')
      .where('user_id_from', user_id_from)
      .orWhere('user_id_to', user_id_to)
      .first();
  },

  deleteFriendRequest(knex, user_id_from, user_id_to) {
    return knex('friend_requests')
      .where({ user_id_from })
      .andWhere({ user_id_to })
      .delete();
  },

  updateFriendRequest(knex, user_id_from, user_id_to, newFriendRequestFields) {
    return knex('friend_requests')
      .where({ user_id_from })
      .andWhere({ user_id_to })
      .update(newFriendRequestFields);
  },
};

module.exports = FriendRequestsService;
