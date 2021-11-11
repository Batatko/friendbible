import styles from "./MessagesList.module.css";

import { Paper } from "@mui/material";

const MessagesList = (props) => {
  const checkMessageId = (item) => {
    if (item.data.ownerId === props.userId) return true;
  };

  return (
    <div className={styles["message-container"]}>
      <Paper
        sx={{ bgcolor: "primary.main"}}
        className={styles["message-window"]}
      >
        {!props.isLoadingMessages && props.chatsData.length === 0 && (
          <div className={styles.default}>Start messaging...</div>
        )}
        {!props.isLoadingMessages &&
          props.chatMessages.map((item) => (
            <div
              key={item.messageId}
              className={`${
                checkMessageId(item)
                  ? styles["message-user"]
                  : styles["message-friend"]
              }`}
            >
              <div className={styles.name}>
                <p>{item.data.ownerName}</p>
              </div>

              <div
                className={`${
                  checkMessageId(item)
                    ? styles["message-container-user"]
                    : styles["message-container-friend"]
                }`}
              >
                <p>{item.data.message}</p>
              </div>
            </div>
          ))}
      </Paper>
    </div>
  );
};

export default MessagesList;
