const GetSender = (chat, loggedUser) => {
  // console.log("logged user is ", loggedUser);

  return chat.users[0]._id === loggeduser?.existinguser?._id
    ? chat.users[1].name
    : chat.users[0].name;
};

export default GetSender;
