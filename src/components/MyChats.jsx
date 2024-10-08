/*import React, { useEffect, useRef, useState } from "react";
import { ChatState } from "../context/chatProvider";
import axios from "axios";
import styles from "../styling/MyChats.module.scss";
import GetSender from "../config/GetSender";
import GroupChatModal from "./miscellaneous/GroupChatModal";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState();

  const chatRef = useRef();

  // const handleOutsideClick = (e) => {
  //   if (
  //     selectedChat !== null &&
  //     chatRef.current &&
  //     !chatRef.current.contains(e.target) &&
  //     !e.target.closest(".chatsender")
  //   ) {
  //     setSelectedChat(null)
  //   }
  // };

  // useEffect(() => {
  //   document.addEventListener("mousedown", handleOutsideClick);
  //   return () => {
  //     document.removeEventListener("mousedown", handleOutsideClick);
  //   };
  // }, []);

  const ChatSender = ({ name, chat }) => {
    return (
      <div
        ref={chatRef}
        onClick={() => setSelectedChat(chat)}
        className={`${styles.senderContainer} chatsender`}
        style={{ backgroundColor: chat === selectedChat ? "#32afc6" : "grey" }}
      >
        {name}
      </div>
    );
  };

  useEffect(() => {
    const fetchChats = async () => {
      while (!user || !user?.token) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Polling with a small delay
      }

      if (!user || !user?.token) {
        console.log("User not logged in or token missing");
        return;
      }
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
        const response = await axios.get(
          "https://cloni-backend.onrender.com/api/chat",
          config
        );

        setChats(response.data.result);
        console.log("Chats of MyChats component are", chats);
      } catch (error) {
        console.log("Error fetching the chats of the logged in user", error);
      }
    };

    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // }, [fetchAgain,]);
  }, [fetchAgain, chats, setChats, user]);

  const [groupChatModal, setGroupChatModal] = useState(false);

  const showGroupChatModal = () => {
    setGroupChatModal(true);
  };

  const hideGroupChatModal = () => {
    setGroupChatModal(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.text}>My Chats</div>
        <div className={styles.groupChatbtn}>
          <button onClick={() => showGroupChatModal()}>New Group Chat +</button>
        </div>
      </div>
      {chats.map((c) => {
        if (c.isGroupChat) {
          return <ChatSender key={c._id} name={c.chatName} chat={c} />;
        } else {
          const sender = GetSender(c, loggedUser);
          return <ChatSender key={c._id} name={sender} chat={c} />;
        }
      })}

      {groupChatModal && (
        <GroupChatModal hideGroupChatModal={hideGroupChatModal} />
      )}
    </div>
  );
};

export default MyChats;
*/

import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChatState } from "../context/chatProvider";
import axios from "axios";
import styles from "../styling/MyChats.module.scss";
import GetSender from "../config/GetSender";
import GroupChatModal from "./miscellaneous/GroupChatModal";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { user, chats, setChats } = ChatState();

  // useEffect(() => {
  //   // console.log("Selected chat updated:", selectedChat);
  //   // Additional logic when selectedChat changes, if needed
  // }, [selectedChat]);

  const fetchChats = useCallback(async () => {
    if (!user || !user?.token) {
      console.log("User not logged in or token missing");
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };
      const response = await axios.get(
        "https://cloni-backend.onrender.com/api/chat",
        config
      );

      // console.log(response.data.result);
      setChats(response.data.result);

      // console.log("Chats of MyChats component are", chats);
    } catch (error) {
      console.log("Error fetching the chats of the logged in user", error);
    }
  }, [user, setChats]); // Use `user` and `setChats` as dependencies

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]); // Only re-run if `fetchAgain` or `fetchChats` changes

  const [groupChatModal, setGroupChatModal] = useState(false);

  const showGroupChatModal = () => {
    setGroupChatModal(true);
  };

  const hideGroupChatModal = () => {
    setGroupChatModal(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.text}>My Chats</div>
        <div className={styles.groupChatbtn}>
          <button onClick={() => showGroupChatModal()}>New Group Chat +</button>
        </div>
      </div>
      {chats.map(
        (c) =>
          c.isGroupChat ? (
            <ChatSender key={c._id} name={c.chatName} chat={c} />
          ) : (
            <ChatSender key={c._id} name={GetSender(c, loggedUser)} chat={c} />
          )
        // if (c.isGroupChat) {
        //   return <ChatSender key={c._id} name={c.chatName} chat={c} />;
        // } else {
        //   const sender = GetSender(c, loggedUser);
        //   return <ChatSender key={c._id} name={sender} chat={c} />;
        // }
      )}

      {groupChatModal && (
        <GroupChatModal hideGroupChatModal={hideGroupChatModal} />
      )}
    </div>
  );
};

export default MyChats;

const ChatSender = ({ name, chat }) => {
  const chatRef = useRef();

  const { selectedChat, setSelectedChat } = ChatState();
  // console.log({ chat, selectedChat });

  const handleChatSelect = () => {
    setSelectedChat(chat);
  };

  return (
    <div
      ref={chatRef}
      onClick={handleChatSelect}
      className={`${styles.senderContainer} chatsender`}
      style={{
        backgroundColor: chat._id === selectedChat?._id ? "#32afc6" : "grey",
      }}
    >
      {name}
    </div>
  );
};
