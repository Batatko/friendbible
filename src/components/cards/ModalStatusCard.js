import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

import useFirebaseData from "../hooks/useFiresbaseData";
import useFirebaseStorage from "../hooks/useFirebaseStorage";

import styles from "./ModalStatusCard.module.css";
import Spinner from "../UI/Spinner";
import Like from "../likes_logic/Like";

import { Card } from "@mui/material";
import { Avatar } from "@mui/material";
import { Paper } from "@mui/material";
import { Button } from "@mui/material";

const ModalStatusCard = (props) => {
  const { getProfilePicture } = useFirebaseStorage();
  const { getComments, postComment } = useFirebaseData();

  const userId = useSelector((state) => state.userId);
  const commentsUnsub = useRef(null);
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsloadingComments] = useState(false);
  const [enteredInput, setEnteredInput] = useState("");
  const [isLoadingPicture, setIsLoadingPicture] = useState(true);
  const [profilePicture, setProfilePicture] = useState("");

  const getCommentsHandler = async (quoteId) => {
    //Gets comments from firebase, resets previous comments state, if new modal quote modal is open,
    //removes live socket from previous commentsUnsub ref, sets new live socket setsComments through getComments callback.

    setIsloadingComments(true);
    setComments([]);
    if (commentsUnsub.current) {
      commentsUnsub.current();
    }
    commentsUnsub.current = await getComments(quoteId, (item) => {
      setComments((prevStat) => [...prevStat, item]);
    });
    setIsloadingComments(false);
  };

  const commentPostHandler = async (e) => {
    //Prevents propagation onClick
    //Posts comment on quote, sends data to firebase database
    //Resets eneteredInput to ""

    e.preventDefault();
    if(!enteredInput) {
      return;
    }
    await postComment(
      {
        name: props.userData.data.name,
        surname: props.userData.data.surname,
      },
      props.quoteId,
      enteredInput
    );

    await props.getCommentsStatsHandler();
    setEnteredInput("");
  };

  const dateHandler = () => {
    //Reformats Firebase server Timestamp

    const date = props.quoteData.time.toString().split(" ");
    const formatDate = `${date[0]}, ${date[1]}, ${date[2]}, ${date[3]}`;
    const formatTime = `${date[4]}`;

    return {
      formatDate,
      formatTime,
    };
  };

  const profilePictureHandler = () => {
    //renders box display according to profilepicture state
    if (isLoadingPicture) {
      return <Spinner />;
    }
    return (
      <div className={styles["avatar-container"]}>
        <Avatar sx={{ width: 50, height: 50 }} src={profilePicture} alt="avt" />
      </div>
    );
  };

  const syncProfilePicture = async () => {
    // gets profile pic, sets in redux
    const link = await getProfilePicture(props.quoteData.userId, false);
    setProfilePicture(link);
    setIsLoadingPicture(false);
  };

  useEffect(() => {
    getCommentsHandler(props.quoteId);
    syncProfilePicture();
  }, []);

  return (
    <Card
      sx={{ bgcolor: "primary.main", elevation: 1 }}
      className={styles.card}
      onClick={props.onClick}
    >
      <div className={styles.header}>
        <Paper sx={{ bgcolor: "primary.light" }} className={styles.box}>
          <div className={styles["avatar-container"]}>
            {profilePictureHandler()}
          </div>
        </Paper>
        <div className={styles.user}>
          <NavLink
            to={`/profile/${props.quoteData.userId}`}
            onClick={props.closeModal}
          >{`${props.quoteData.user.name} ${props.quoteData.user.surname}`}</NavLink>
          <p className={styles.date}>
            {dateHandler().formatDate} {dateHandler().formatTime}
          </p>
        </div>
      </div>
      <div className={styles.status}>{props.quoteData.text}</div>
      <div
        className={`${styles.comments} ${
          comments.length >= 3 && styles["comments-full"]
        }`}
      >
        {isLoadingComments && <Spinner />}
        {!isLoadingComments &&
          comments.map((item) => (
            <div key={item.messageId} className={styles["comment-card"]}>
              <div className={styles["comment-user"]}>
                <NavLink
                  to={`/profile/${props.quoteData.userId}`}
                >{`${item.data.ownerName.name} ${item.data.ownerName.surname}`}</NavLink>
                <p>
                  {dateHandler().formatDate} {dateHandler().formatTime}
                </p>
              </div>
              <div className={styles.comment}>{item.data.message}</div>
            </div>
          ))}
      </div>

      <div className={styles["like-container"]}>
        <Like
          userId={userId}
          quoteId={props.quoteId}
          quoteLikes={props.quoteLikes}
          getLikesStatsHandler={props.getLikesStatsHandler}
        />
      </div>

      <div className={styles["input-container"]}>
        <form id="comment" onSubmit={commentPostHandler}>
          <label htmlFor="comment-input">
            <textarea
              id="comment-input"
              type="text"
              value={enteredInput}
              onChange={(e) => setEnteredInput(e.target.value)}
            ></textarea>
          </label>
          <Button
            sx={{fontSize: "15px", fontWeight: "550"}}
            className={styles.send}
            variant="contained"
            color={"secondary"}
            type="submit"
            form="comment"
          >
            Post
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default ModalStatusCard;
