import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import useFirestoreData from "../hooks/useFirestoreData";
import useFirebaseData from "../hooks/useFiresbaseData";

import styles from "./Messages.module.css";
import Feed from "../layout/Feed";
import Spinner from "../UI/Spinner";

import MessageMain from "../messages/MessageMain";

import { Card } from "@mui/material";

const Messages = () => {
  //REDUX
  const userId = useSelector((state) => state.userId);

  //DATABASE
  const { deleteChat } = useFirebaseData();
  const {
    getUserData,
    getFriends,
    createChatInfo,
    checkIfChatExists,
    getChats,
    deleteChatInfo,
  } = useFirestoreData();

  //STATES
  const [userData, setUserData] = useState(null);
  const [isLoadingUser, setIsloadingUser] = useState(true);
  const [isFriendsList, setIsFriendsList] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  const [chatsData, setChatsData] = useState([]);

  const [chatMessages, setChatMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  //HANDLERS
  const getFriendsData = async () => {
    const friends = await getFriends();
    const friendsList = [];

    if (friends) {
      for (let i = 0; i < friends.following.length; i++) {
        const person = await getUserData(friends.following[i]);
        friendsList.push({
          name: person.name,
          surname: person.surname,
          friendId: friends.following[i],
        });
      }
      return friendsList;
    }
  };

  const userDataHandler = async () => {
    //Gets user and friend data, sets loadingUser state

    setIsloadingUser(true);
    const data = await getUserData();
    const friendsData = await getFriendsData();
    setUserData({
      data: data,
      friends: [...friendsData],
    });

    await chatDataHandler(true, data)

    setIsloadingUser(false);
  };

  const chatDataHandler = async (firstLoad, data = null) => {
    //Gets ongoing chats for User, loads first chat on display container
    //sets chatsData state
    const user = data ? data : userData.data;

    const resData = await getChats();

    let userChats = [];
    for (const chat of resData) {
      if (user.chatId.includes(chat.chatId)) {
        userChats.push(chat);
      }
    }

    if (userChats.length === 0) {
      setChatsData([]);
    };

    //sort chat list by lastMessage Timestamp
    const chatSort = userChats.sort(
      (a, b) => b.data.lastMessage.toDate() - a.data.lastMessage.toDate()
    );

    //if firstLoad set First chat
    if (chatSort.length !== 0 && firstLoad) {
      setSelectedChat(chatSort[0].chatId);
    }

    setChatsData(chatSort);
  };

  const initChatHandler = async (friendId) => {
    //Initalizes chat, gets friendData and checks if already exists,
    //activates userDataHandler and chatDataHandler, sets FriendsList state

    const friendData = await getUserData(friendId);
    const exists = await checkIfChatExists(
      friendData.chatId,
      userData.data.chatId
    );
    if (!exists) {
      // function takes members info and memeber ids parameter ({},[])
      await createChatInfo(
        {
          [userId]: {
            name: userData.data.name,
            surname: userData.data.surname,
            id: userId,
          },
          [friendId]: {
            name: friendData.name,
            surname: friendData.surname,
            id: friendId,
          },
        },
        [userId, friendId],
        userId
      );
      await userDataHandler();
      setIsFriendsList(false);
    } else {
      setIsFriendsList(false);
    }
  };

  const deleteChatHandler = async () => {
    //Deletes ChatInfo, ChatDatabase, activates ChatDataHandler for rerender
    if (selectedChat) {
      setChatMessages([]);
      await deleteChatInfo(selectedChat);
      await deleteChat(selectedChat);
      await userDataHandler();
    }
  };


  const checkChatOwner = (item) => {
    //checks chat ownerId, displays chat name according to logged user (userId)

    if (userId === item.data.ownerId) {
      let user;
      for (const id in item.data.members) {
        if (id !== item.data.ownerId) user = id;
      }
      return (
        <p>{`${item.data.members[user].name} ${item.data.members[user].surname}`}</p>
      );
    } else {
      return (
        <p>{`${item.data.members[item.data.ownerId].name} ${
          item.data.members[item.data.ownerId].surname
        }`}</p>
      );
    }
  };

  const openContainerHandler = () => {
    if (userData.friends.length === 0) {
      return;
    }
    setIsFriendsList(true);
  };

  const closeContainerHandler = () => {
    //Changes value for FriendsList state
    return !isFriendsList ? "friends-container-close" : "";
  };

  useEffect(() => {
    userDataHandler();
  }, []);

  return (
    <Feed className={styles.feed}>
      <div className={styles["page-wrap"]}>
        <div className={styles["chat-container-wrap"]}>
          <div className={styles["chat-container"]}>
            <Card sx={{ bgcolor: "primary.light" }} className={styles.control}>
              <Card
                sx={{ bgcolor: "primary.main" }}
                className={styles.item}
                onClick={openContainerHandler}
              >
                FriendsList
              </Card>

              <Card
                sx={{ bgcolor: "primary.main" }}
                className={styles.item}
                onClick={deleteChatHandler}
              >
                Delete Chat
              </Card>
            </Card>

            {chatsData.map((item, i) => (
              <Card
                sx={{ bgcolor: "primary.light" }}
                key={i}
                className={`${styles.item} ${
                  selectedChat === item.chatId && styles.selected
                }`}
                onClick={() => setSelectedChat(item.chatId)}
              >
                {checkChatOwner(item)}
              </Card>
            ))}
          </div>

          <div
            className={`${styles["friends-container"]} ${
              styles[closeContainerHandler()]
            }`}
          >
            {isLoadingUser && <Spinner className={styles.spin} />}
            {!isLoadingUser &&
              userData.friends.map((item, i) => {
                return (
                  <Card
                    sx={{ bgcolor: "primary.light" }}
                    key={i}
                    className={styles.item}
                    onClick={() => initChatHandler(item.friendId)}
                  >
                    <p>{`${item.name} ${item.surname}`}</p>
                  </Card>
                );
              })}
          </div>
        </div>

        <div className={styles["display-container"]}>
          <MessageMain
            selectedChat={selectedChat}
            userData={userData}
            userId={userId}
            chatsData={chatsData}
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            isLoadingMessages={isLoadingMessages}
            setIsLoadingMessages={setIsLoadingMessages}
            chatDataHandler={chatDataHandler}
          />
        </div>
      </div>
    </Feed>
  );
};

export default Messages;
