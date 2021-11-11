import { useState, Fragment, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import useFirebaseStorage from "../hooks/useFirebaseStorage";

import styles from "./StatusCard.module.css";
import Spinner from "../UI/Spinner";

import { Card } from "@mui/material";
import { Paper } from "@mui/material";
import { Avatar } from "@mui/material";
import { Menu } from "@mui/material";
import { MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const StatusCard = (props) => {
  const userId = useSelector((state) => state.userId);
  const profilePicture = useSelector((state) => state.profilePicture);

  const { getProfilePicture } = useFirebaseStorage();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [isLoadingPicture, setIsLoadingPicture] = useState(false);
  const [picture, setPicture] = useState("");

  const dateHandler = () => {
    const date = props.data.time.toString().split(" ");
    const formatDate = `${date[0]}, ${date[1]}, ${date[2]}, ${date[3]}`;
    const formatTime = `${date[4]}`;

    return {
      formatDate,
      formatTime,
    };
  };

  const checkUser = () => {
    //checks if userId === quote userId
    if (userId === props.data.userId) return true;
  };

  const commentNumHandler = () => {
    //Checks if quoteId in commentStats
    //If true, yields comments num for quoteId

    for (let item in props.commentStats) {
      if (item === props.data.quoteId) {
        return Object.keys(props.commentStats[item]).length;
      }
    }
    return 0;
  };

  const likesNumHandler = () => {
    //Checks if quoteId in likesStats
    //If true, yields likes num for quoteId

    for (let item in props.likesStats) {
      if (item === props.data.quoteId) {
        return Object.keys(props.likesStats[item]).length;
      }
    }
    return 0;
  };

  const profilePictureHandler = () => {
    //renders box display according to profilepicture state
    if (isLoadingPicture) {
      return <Spinner />;
    }
    return (
      <div className={styles["avatar-container"]}>
        <Avatar sx={{ width: 50, height: 50 }} src={picture} alt="avt" />
      </div>
    );
  };

  const syncProfilePicture = async () => {
    // gets profile pic, sets in redux
    setIsLoadingPicture(true);
    const link = await getProfilePicture(props.data.userId, false);
    setPicture(link);
    setIsLoadingPicture(false);
  };

  const shareButtonHandler = () => {
    handleClose();
    props.openModalStatus(props.data.quoteId, true);
  };

  useEffect(() => {
    syncProfilePicture();
  }, [profilePicture]);

  return (
    <Card
      sx={{
        bgcolor: `${props.isShare ? "primary.light" : "primary.main"}`,
        elevation: 1,
      }}
      className={`${styles.card} ${props.isShare && styles["card-share"]}`}
    >
      <div className={styles.header}>
        <Paper
          sx={{
            bgcolor: `${props.isShare ? "primary.main" : "primary.light"}`,
          }}
          className={styles.box}
        >
          {profilePictureHandler()}
        </Paper>
        <div className={styles.user} onClick={(e) => e.stopPropagation()}>
          {!props.isShare && (
            <NavLink
              to={`/profile/${props.data.userId}`}
            >{`${props.data.user.name} ${props.data.user.surname}`}</NavLink>
          )}
          {props.isShare && (
            <p
              className={styles["user-name"]}
            >{`${props.data.user.name} ${props.data.user.surname}`}</p>
          )}
          <p className={styles.date}>
            {dateHandler().formatDate} {dateHandler().formatTime}
          </p>
        </div>
        <div className={styles["option-container"]}>
          {!props.isShare && (
            <MoreVertIcon
              className={styles.option}
              alt="option"
              onClick={handleClick}
            />
          )}
          <Fragment>
            <Menu
              elevation={2}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
            >
              {checkUser() && (
                <MenuItem
                  onClose={handleClose}
                  onClick={(e) =>
                    props.deleteQuoteHandler(
                      e,
                      props.data.userId,
                      props.data.quoteId
                    )
                  }
                >
                  Delete
                </MenuItem>
              )}
              {!props.isProfile && (
                <MenuItem onClose={handleClose} onClick={shareButtonHandler}>
                  Share
                </MenuItem>
              )}
            </Menu>
          </Fragment>
        </div>
      </div>
      <div className={styles.status}>{props.data.text}</div>
      <div className={styles.interactions}>
        <p onClick={props.onClick}>{`Likes (${likesNumHandler()})`}</p>
        <p onClick={props.onClick}>{`Comments (${commentNumHandler()})`}</p>
      </div>
    </Card>
  );
};

export default StatusCard;
