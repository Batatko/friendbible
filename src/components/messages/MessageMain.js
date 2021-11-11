import { useState, useEffect, useRef, Fragment } from "react";

import useFirestoreData from "../hooks/useFirestoreData";
import useFirebaseData from "../hooks/useFiresbaseData";

import styles from "./MessageMain.module.css";

import MessagesList from "../messages/MessagesList";

import { Button } from "@mui/material";

const MessageMain = (props) => {
  const { setLastMessageTime } = useFirestoreData();
  const { getChatMessages, sendMessage } = useFirebaseData();
  const [enterText, setEnterText] = useState("");

  const chatUnsub = useRef(null);

  const getMessagesHandler = (chatId) => {
    //Gets messages from firebase, resets previous messages state, if new chat is selected,
    //removes live socket from previous chatUnsub ref, sets new live socket setsChatMessages through getChatMessages callback.

    props.setIsLoadingMessages(true);
    props.setChatMessages([]);
    if (chatUnsub.current) {
      chatUnsub.current();
    }
    chatUnsub.current = getChatMessages(chatId, (item) => {
      props.setChatMessages((prev) => [...prev, item]);
    });
    props.setIsLoadingMessages(false);
  };

  const sendMessageHandler = async (e) => {
    //Posts message in firebase
    e.preventDefault();

    if (props.chatsData.length === 0) {
      return;
    }

    if (enterText === "") return;
    if (props.selectedChat) {
      await sendMessage(
        props.selectedChat,
        props.userData.data.name,
        props.userId,
        enterText
      );

      setLastMessageTime(props.selectedChat);

      await props.chatDataHandler();
    }
    setEnterText("");
  };

  useEffect(() => {
    if (props.selectedChat) {
      getMessagesHandler(props.selectedChat);
    }
  }, [props.selectedChat]);

  return (
    <Fragment>
      <div className={styles["message-container-wrap"]}>
        <MessagesList
          chatId={props.selectedChat}
          userId={props.userId}
          selectedChat={props.selectedChat}
          chatMessages={props.chatMessages}
          chatsData={props.chatsData}
          getMessagesHandler={getMessagesHandler}
          isLoadingMessages={props.isLoadingMessages}
        />
      </div>
      <div className={styles["send-container-wrap"]}>
        <form
          id="send-message"
          onSubmit={sendMessageHandler}
          className={styles["send-container"]}
        >
          <textarea
            id="message-box"
            type="text"
            value={enterText}
            onChange={(e) => setEnterText(e.target.value)}
          />
          <div className={styles["button-container"]}>
            <Button
              sx={{ fontSize: "15px", fontWeight: "550" }}
              className={styles.send}
              variant="contained"
              color={"secondary"}
              type="submit"
              form="send-message"
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    </Fragment>
  );
};

export default MessageMain;
