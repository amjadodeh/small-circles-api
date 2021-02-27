function makeFriendRequestsArray() {
  return [
    {
      id: 1,
      user_id_from: 2,
      user_id_to: 4,
      request_status: 'Pending',
    },
    {
      id: 2,
      user_id_from: 4,
      user_id_to: 1,
      request_status: 'Pending',
    },
  ];
}

module.exports = {
  makeFriendRequestsArray,
};
