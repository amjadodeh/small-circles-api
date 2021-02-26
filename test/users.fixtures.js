function makeUsersArray() {
  return [
    {
      username: 'User1',
      hash: '$2y$10$uAc6blm.FnQJtQO3HBJUmuZS/RRoqJnSzj7CnpxO1eZlqhSFDpOAi',
      profile_picture:
        'https://images.pexels.com/photos/772478/pexels-photo-772478.jpeg',
      friends: '2,3',
    },
    {
      username: 'User2',
      hash: '$2y$10$F3rlx.Wx4eZG/QQXjLVqTuQmuNGIuB9R9QRkmkqAS47jfGUgjcBp.',
      profile_picture:
        'https://images.pexels.com/photos/772478/pexels-photo-772478.jpeg',
      friends: '1,3',
    },
    {
      username: 'User3',
      hash: '$2y$10$qnOKDZKrZVgMG2c6TB0gy.BPXxkRoUCnUNZ79LfYQHiH6q21F21g6',
      profile_picture:
        'https://images.pexels.com/photos/772478/pexels-photo-772478.jpeg',
      friends: '1,2',
    },
    {
      username: 'User4',
      hash: '$2y$10$b4xqWkHBRAjXxji7aKKQDua.FcamXwIogybqIsLUOy6z/V8gSl5J6',
      profile_picture:
        'https://images.pexels.com/photos/772478/pexels-photo-772478.jpeg',
      friends: null,
    },
  ];
}

module.exports = {
  makeUsersArray,
};
