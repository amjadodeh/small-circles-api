function makeFriendRequestsArray() {
  return [
    {
      user_id_from: 2,
      user_id_to: 4,
      request_status: 'Pending',
    },
    {
      user_id_from: 4,
      user_id_to: 1,
      request_status: 'Pending',
    },
  ];
}

module.exports = {
  makeFriendRequestsArray,
};
