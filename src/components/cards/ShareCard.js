import { useState, Fragment, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import useFirebaseStorage from "../hooks/useFirebaseStorage";

import styles from "./ShareCard.module.css";
import Spinner from "../UI/Spinner";

import { Card } from "@mui/material";
import { Paper } from "@mui/material";
import { Avatar } from "@mui/material";
import { Menu } from "@mui/material";
import { MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const ShareCard = (props) => {
  const userId = useSelector((state) => state.userId);
  const profilePicture = useSelector((state) => state.profilePicture);

  const { getProfilePicture } = useFirebaseStorage();
  const [isLoadingPicture, setIsLoadingPicture] = useState(false);
  const [picture, setPicture] = useState("");

  const checkUser = () => {
    //checks if userId === quote userId
    if (userId === props.data.userId) return true;
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const dateHandler = () => {
    const date = props.data.time.toString().split(" ");
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

  useEffect(() => {
    syncProfilePicture();
  }, [profilePicture]);

  return (
    <Card
      sx={{ bgcolor: "primary.main", elevation: 1 }}
      className={styles.card}
    >
      <div className={styles.header}>
        <Paper sx={{ bgcolor: "primary.light" }} className={styles.box}>
          {profilePictureHandler()}
        </Paper>
        <div className={styles.user}>
          <NavLink
            to={`/profile/${props.data.userId}`}
            className={styles["user-name"]}
          >{`${props.data.user.name} ${props.data.user.surname}`}</NavLink>
          <p className={styles.date}>
            {dateHandler().formatDate} {dateHandler().formatTime}
          </p>
        </div>
        <div className={styles["option-container"]}>
          {props.isShare && checkUser() && (
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
                    props.deleteShareHandler(
                      e,
                      props.data.userId,
                      props.data.shareId
                    )
                  }
                >
                  Delete
                </MenuItem>
              )}
            </Menu>
          </Fragment>
        </div>
      </div>
      {props.children}
    </Card>
  );
};

export default ShareCard;
