import React, { useCallback, useState, useEffect, useRef } from "react";
import { ChatState } from "../context/chatProvider";
import styles from "../styling/SingleChat.module.scss";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { IoEye } from "react-icons/io5";
import Modal2 from "./miscellaneous/Modal2.jsx";
import GetSenderFull from "../config/GetSenderFull.js";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal.jsx";
import { ChatLoading } from "./miscellaneous/SearchBar.jsx";
import axios from "axios";
import ScrollableChat from "./ScrollableChat.jsx";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import GetSender from "../config/GetSender";

const ENDPOINT = "https://cloni-backend.onrender.com";

const SingleChat = ({ fetchAgain, setFetchAgain, socket, socketConnected }) => {
  const {
    user,
    selectedChat,
    setSelectedChat,
    // storedNotification,
    // setStoredNotification,
  } = ChatState();

  // useEffect(() => {
  //   console.log(selectedChat);
  // }, [selectedChat]);

  console.log("selectedChat", selectedChat);

  // console.log(user?.token);

  const [openModal, setOpenModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const selectedChatRef = useRef(selectedChat);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const closeModal = () => setOpenModal(false);
  const hideUpdateModal = () => setOpenUpdateModal(false);

  const fetchMessages = useCallback(async () => {
    if (selectedChat && Object.keys(selectedChat).length === 0) {
      // console.log("Selected chat is undefined");
      return;
    }
    // console.log("FetchmMessages being called");

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      setLoading(true);

      console.log(selectedChat?._id);

      if (selectedChat?._id) {
        const { data } = await axios.get(
          `${ENDPOINT}/api/message/${selectedChat._id}`,
          config
        );

        // console.log("data of fetchmessages", data);

        setMessages(data.messages);

        setLoading(false);

        socket.emit("join chat", selectedChat._id);
      } else {
        console.log("No chat selected");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
    }
  }, [selectedChat, user?.token, socket]);

  // const handleNotification = (newNotif) => {
  //   const storedNotification1 = localStorage.getItem("storedNotification");
  //   const notifications = storedNotification1
  //     ? JSON.parse(storedNotification1)
  //     : [];
  //   const temp = [...notifications, newNotif];
  //   setStoredNotification(temp);
  //   localStorage.setItem("storedNotification", JSON.stringify(temp));
  // };

  useEffect(() => {
    // const storedNotification1 = localStorage.getItem("storedNotification");
    // const notifications = storedNotification1
    //   ? JSON.parse(storedNotification1)
    //   : [];

    // setStoredNotification((prev) => [...prev, ...notifications])

    if (socket) {
      socket.on("message received", (newMessageReceived) => {
        // console.log("Message received step 1");
        // console.log("Selected chat", selectedChat);
        // console.log(selectedChat);

        if (
          Object.keys(selectedChatRef.current).length === 0 ||
          selectedChatRef.current?._id !==
            newMessageReceived?.newMessage?.chat?._id
        ) {
          console.log({ selectedChatRef });

          // if (
          //   !storedNotification.some(
          //     (n) => n._id === newMessageReceived?.newMessage?._id
          //   )
          // ) {
          //   console.log(
          //     storedNotification.some(
          //       (n) => n._id === newMessageReceived?.newMessage?._id
          //     ),
          //     storedNotification
          //   );

          //   let newNotif = newMessageReceived?.newMessage;
          //   // console.log(storedNotification,newNotif)
          //   handleNotification(newNotif);
          //   // console.log("notification step2", storedNotification);
          //   // setFetchAgain(!fetchAgain);
          //   // }
          // } else {
          //   return;
          // }
        } else {
          // console.log("messages list when message received", messages);
          setMessages([...messages, newMessageReceived.newMessage]);
        }
      });
    }
  }, [socket, messages]);

  /* useEffect(() => {
    const handleNotification = (newNotif) => {
      // console.log("chatttttiingg")
      setNotification((prevNotification) => {
        const temp = [...prevNotification, newNotif];
        localStorage.setItem("storedNotification", JSON.stringify(temp));
        return temp;
      });
    };

    const connectSocket = () => {
      socket = io(ENDPOINT, {
        transports: ["websocket", "polling"],
        secure: true,
        rejectUnauthorized: false,
        reconnection: true,
        // reconnectionAttempts: 5,
        // reconnectionDelay: 1000,
        // timeout: 20000, // Set connection timeout
        // pingTimeout: 60000, // Increase ping timeout to handle network latency
        // upgrade: true,
      });

      socket.on("connect", () => {
        console.log("Connected to socket.io");
        setSocketConnected(true);
        socket.emit("setup", user);
      });

      socket.on("connect_error", (error) => {
        console.error("Connection Error:", error);
        setTimeout(connectSocket, 5000);
      });

      socket.on("disconnect", (reason) => {
        console.log("Disconnected:", reason);
        if (reason === "io server disconnect") {
          // The disconnection was initiated by the server, reconnect manually
          socket.connect();
        } else {
          setSocketConnected(false);
        }
      });

      socket.on("message received", (newMessageReceived) => {
        // console.log("message received", newMessageReceived);

        // console.log({ selectedChat, newMessageReceived });

        console.log("Hello");

        if (
          !!selectedChat ||
          selectedChat?._id !== newMessageReceived?.newMessage?.chat?._id
        ) {
          // Handle notification
          // console.log("notification step1", notification);

          // if (
          //   !notification ||
          //   !notification.some(
          //     (n) => n._id === newMessageReceived?.newMessage?._id
          //   )
          // ) {
          // console.log("notification step2", notification);
          let newNotif = newMessageReceived?.newMessage;
          console.log(newNotif);
          handleNotification(newNotif);
          // console.log("notification step3", notification);
          // setFetchAgain(!fetchAgain);
          // }
        } else {
          // console.log("messages list when message received", messages);
          setMessages([...messages, newMessageReceived.newMessage]);
        }
      });
    };

    connectSocket();

    return () => {
      if (socket && socket.conected) {
        socket.disconnect();
      }
    };
  }, [
    user,
    fetchAgain,
    messages,
    notification,
    selectedChat,
    setFetchAgain,
    setNotification,
  ]);*/

  useEffect(() => {
    fetchMessages();
  }, [selectedChat, fetchMessages]);

  useEffect(() => {
    if (socket) {
      socket.on("typing", () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));
      // console.log("333");
    }

    return () => {
      if (socket) {
        socket.off("typing");
        socket.off("stop typing");
      }
    };
  }, [socket]);

  const sendMessage = async (event) => {
    if (!socket) {
      console.error("Socket not initialized");
      return;
    }
    if (event.key === "Enter" && newMessage) {
      console.log("Hello");
      socket.emit("stop typing", selectedChat?._id);
      // console.log("send-11");
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        };
        // console.log("send-22");
        setNewMessage("");
        const { data } = await axios.post(
          `${ENDPOINT}/api/message`,
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        // console.log("send-33");
        socket.emit("new message", data);
        // console.log("send-44");
        const messagesList = messages;
        // console.log("message list", messagesList);
        // console.log("data", data);

        setMessages([...messagesList, data.newMessage]);
        console.log("all messages", messages);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    let timerLength = 3000;
    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  // useEffect(() => {
  //   const removeNotification = (chat) => {
  //     // console.log("remove notification", notification);
  //     const storedNotification1 = localStorage.getItem("storedNotification");
  //     const notifications = storedNotification1
  //       ? JSON.parse(storedNotification1)
  //       : [];
  //     const updatedNotification = notifications?.filter(
  //       (notif) => notif.chat._id !== chat._id
  //     );

  //     setStoredNotification(updatedNotification);

  //     localStorage.setItem(
  //       "storedNotification",
  //       JSON.stringify(updatedNotification)
  //     );
  //   };

  //   if (selectedChat && Object.keys(selectedChat).length > 0) {
  //     removeNotification(selectedChat);
  //     // console.log("4444");
  //   } else {
  //     return;
  //   }
  // }, [selectedChat]);

  return (
    <div className={styles.container}>
      {selectedChat && Object.keys(selectedChat).length !== 0 ? (
        <div className={styles.content}>
          <div className={styles.heading}>
            <div className={styles.arrow}>
              <FaArrowAltCircleLeft
                onClick={() => {
                  setSelectedChat({});
                }}
              />
            </div>
            {selectedChat.isGroupChat ? (
              <div className={styles.chatTitle}>
                {selectedChat.chatName.toUpperCase()}
              </div>
            ) : (
              <div className={styles.chatTitle}>
                {GetSender(selectedChat, user)}
              </div>
            )}
            {!selectedChat.isGroupChat ? (
              <div className={styles.eyeIcon}>
                <IoEye
                  onClick={() => {
                    setOpenModal(true);
                  }}
                />
              </div>
            ) : (
              <div className={styles.eyeIcon}>
                <IoEye
                  onClick={() => {
                    setOpenUpdateModal(true);
                  }}
                />
              </div>
            )}

            {openModal && (
              <Modal2
                user={GetSenderFull(selectedChat, user)}
                handleClose={closeModal}
              />
            )}
            {openUpdateModal && (
              <UpdateGroupChatModal
                hideUpdateModal={hideUpdateModal}
                fetchAgain={fetchAgain}
                setFetchAgain={setFetchAgain}
                fetchMessages={fetchMessages}
              />
            )}
          </div>
          <div className={styles.chat}>
            {loading ? (
              <div className={styles.spinner}>
                <ChatLoading />
              </div>
            ) : (
              <div className={styles.messages}>
                <ScrollableChat messages={messages} />
              </div>
            )}
            <div className={styles.msgBox}>
              {isTyping ? (
                <div
                  style={{
                    marginBottom: "15px",
                    marginLeft: "0px",
                    width: "70px",
                  }}
                >
                  <Lottie options={defaultOptions} />
                </div>
              ) : (
                <></>
              )}
              <input
                type="text"
                onKeyDown={(event) => sendMessage(event)}
                onChange={(event) => typingHandler(event)}
                value={newMessage}
                placeholder="Type your message..."
              />
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.text}>Click on a user to start chatting</div>
      )}
    </div>
  );
};

export default SingleChat;
