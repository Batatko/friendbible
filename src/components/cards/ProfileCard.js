import { useEffect, Fragment } from "react";
import { useSelector } from "react-redux";

import useFirebaseStorage from "../hooks/useFirebaseStorage.js";

import styles from "./ProfileCard.module.css";
import Spinner from "../UI/Spinner";

import { Card } from "@mui/material";
import { Paper } from "@mui/material";
import { Avatar } from "@mui/material";
import { Button } from "@mui/material";

const ProfileCard = (props) => {
  const profilePicture = useSelector((state) => state.profilePicture);
  const { getProfilePicture } = useFirebaseStorage();

  //PROFILE PICTURE HANDLERS
  const syncProfilePicture = async () => {
    //gets profile pic, sets in redux
    props.setIsLoadingPicture(true);

    await getProfilePicture(props.profileId);

    props.setIsLoadingPicture(false);
  };

  const profilePictureHandler = () => {
    //renders box display according to profilepicture state
    if (props.isLoadingPicture) {
      return <Spinner />;
    }
    return (
      <div className={styles["img-container"]}>
        <Avatar
          sx={{ width: 200, height: 200 }}
          src={profilePicture}
          alt="profile"
        />
      </div>
    );
  };

  //FOLLOW LOGIC BUTTON RENDER
  const checkIsFollowing = () => {
    if (props.isFollowing) {
      return (
        <Button
          sx={{ fontSize: "15px", fontWeight: "550" }}
          className={styles.button}
          variant="contained"
          color={"secondary"}
          onClick={() => props.removeFollowerHandler(props.profileId)}
        >
          Unfollow
        </Button>
      );
    } else {
      return (
        <Button
          sx={{ fontSize: "15px", fontWeight: "550" }}
          className={styles.button}
          variant="contained"
          color={"secondary"}
          onClick={() => props.addFollowerHandler(props.profileId)}
        >
          Follow
        </Button>
      );
    }
  };

  useEffect(() => {
    syncProfilePicture();
  }, [props.profileId]);

  return (
    <Fragment>
      {props.isLoadingUser ? (
        <Spinner />
      ) : (
        <Card sx={{ bgcolor: "primary.main" }} className={styles.card}>
          {props.userId === props.profileId ? (
            <section className={styles.header}>
              <Paper
                sx={{ bgcolor: "primary.light" }}
                className={styles.box}
                onClick={props.handleOpenPicture}
              >
                {profilePictureHandler()}
              </Paper>
              <div className={styles["user-info"]}>
                <div className={styles["name-container"]}>
                  <p>{`${props.userData.data.name} ${props.userData.data.surname}`}</p>
                </div>
              </div>
              <div className={styles["friends-stats"]}>
                <div className={styles.stats}>
                  <p>Followers:</p>
                  <p>{props.userData.followers.length}</p>
                </div>
                <div className={styles.stats}>
                  <p>Following:</p>
                  <p>{props.userData.following.length}</p>
                </div>
              </div>
            </section>
          ) : (
            <section className={styles.header}>
              <Paper
                sx={{ bgcolor: "primary.light" }}
                className={styles.box}
                onClick={props.openModalStatus}
              >
                {profilePictureHandler()}
              </Paper>
              <div className={styles["user-info"]}>
                <div className={styles["name-container"]}>
                  <p>{`${props.profileData.data.name} ${props.profileData.data.surname}`}</p>
                </div>
                <div className={styles["follow-container"]}>
                  {checkIsFollowing()}
                </div>
              </div>
              <div className={styles["friends-stats"]}>
                <div className={styles.stats}>
                  <p>Followers:</p>
                  <p>{props.profileData.followers.length}</p>
                </div>
                <div className={styles.stats}>
                  <p>Following:</p>
                  <p>{props.profileData.following.length}</p>
                </div>
              </div>
            </section>
          )}
        </Card>
      )}
    </Fragment>
  );
};

export default ProfileCard;
