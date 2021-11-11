import { useSelector } from "react-redux";

import useFirestoreData from "../hooks/useFirestoreData";

import styles from "./ShareModalCard.module.css";

import { Card } from "@mui/material";
import { Avatar } from "@mui/material";
import { Paper } from "@mui/material";
import { Button } from "@mui/material";

const ShareModalCard = (props) => {
  const userId = useSelector((state) => state.userId);
  const profilePicture = useSelector((state) => state.profilePicture);
  const { addShare } = useFirestoreData();

  const postShareQuote = async () => {
    //uses addShare hook to post data on Firestore

    await addShare({
      share: true,
      userId: userId,
      user: {
        name: props.userData.data.name,
        surname: props.userData.data.surname,
      },
      quoteId: props.quoteId,
    });

    props.postsHandler();
    props.closeModal();
  };

  return (
    <Card
      sx={{ bgcolor: "primary.main", elevation: 1 }}
      className={styles.card}
    >
      <div className={styles.header}>
        <Paper sx={{ bgcolor: "primary.light" }} className={styles.box}>
          <div className={styles["avatar-container"]}>
            <Avatar
              sx={{ width: 50, height: 50 }}
              src={profilePicture}
              alt="avt"
            />
          </div>
        </Paper>
        <div className={styles.user}>
          <p>{`${props.userData.data.name} ${props.userData.data.surname}`}</p>
        </div>
      </div>
      {props.children}
      <div className={styles["share-container"]}>
        <Button
          variant="contained"
          color={"secondary"}
          className={styles.share}
          onClick={postShareQuote}
        >
          Share
        </Button>
      </div>
    </Card>
  );
};

export default ShareModalCard;
