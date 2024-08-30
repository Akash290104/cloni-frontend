const GetSenderFull = (chat, loggedUser) => {
  return chat.users[0]._id === loggedUser?.existinguser?._id
    ? chat.users[1]
    : chat.users[0];
};

export default GetSenderFull;
