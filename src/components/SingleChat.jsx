import React, { useCallback, useState, useEffect } from "react";
import { ChatState } from "../context/chatProvider";
import styles from "../styling/SingleChat.module.scss";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { IoEye } from "react-icons/io5";
import getSender from "../config/GetSender";
import Modal2 from "./miscellaneous/Modal2.jsx";
import GetSenderFull from "../config/GetSenderFull.js";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal.jsx";
import { ChatLoading } from "./miscellaneous/SearchBar.jsx";
import axios from "axios";
import ScrollableChat from "./ScrollableChat.jsx";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

const ENDPOINT = "https://cloni-backend.onrender.com"; // Ensure this is HTTPS
let socket;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();
  
    console.log(user.data.token);

  const [openModal, setOpenModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

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
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.data.token}`,
        },
      };

      setLoading(true);
      const { data } = await axios.get(
        `${ENDPOINT}/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
    }
  }, [selectedChat, user?.data.token]);

  useEffect(() => {
    const connectSocket = () => {
      socket = io(ENDPOINT, {
        transports: ["websocket"],
        secure: true,
        rejectUnauthorized: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
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
        setSocketConnected(false);
      });

      socket.on("message received", (newMessageReceived) => {
        if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
          // Handle notification
          if (!notification.some((n) => n._id === newMessageReceived._id)) {
            setNotification([newMessageReceived, ...notification]);
            setFetchAgain(!fetchAgain);
          }
        } else {
          setMessages([...messages, newMessageReceived]);
        }
      });
    };

    connectSocket();

    return () => {
      if (socket && socket.conected) {
        socket.disconnect();
      }
    };
  }, [user, notification, setNotification, fetchAgain, setFetchAgain, messages, selectedChat]);

  useEffect(() => {
    fetchMessages();
  }, [selectedChat, fetchMessages]);

  useEffect(() => {
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.off("typing");
      socket.off("stop typing");
    };
  }, []);

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.data.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          `${ENDPOINT}/api/message`,
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
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

  const removeNotification = (chat, notification) => {
    const updatedNotification = notification.filter(
      (notif) => notif.chat._id !== chat._id
    );
    localStorage.setItem(
      "storedNotification",
      JSON.stringify(updatedNotification)
    );
    return updatedNotification;
  };

  useEffect(() => {
    if (selectedChat) {
      setNotification((prevNotification) =>
        removeNotification(selectedChat, prevNotification)
      );
    }
  }, [selectedChat, setNotification]);

  return (
    <div className={styles.container}>
      {selectedChat ? (
        <div className={styles.content}>
          <div className={styles.heading}>
            <div className={styles.arrow}>
              <FaArrowAltCircleLeft onClick={() => setSelectedChat("")} />
            </div>
            {selectedChat.isGroupChat ? (
              <div className={styles.chatTitle}>
                {selectedChat.chatName.toUpperCase()}
              </div>
            ) : (
              <div className={styles.chatTitle}>
                {getSender(selectedChat, user)}
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
                <div>
                  <Lottie
                    options={defaultOptions}
                    style={{
                      marginBottom: "15px",
                      marginLeft: "0px",
                      width: "70px",
                    }}
                  />
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
