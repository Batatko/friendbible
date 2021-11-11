import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import useFirebaseStorage from "../hooks/useFirebaseStorage";

import styles from "./HomeProfileCard.module.css";
import Spinner from "../UI/Spinner";

import { Card } from "@mui/material";
import { Paper } from "@mui/material";
import { Avatar } from "@mui/material";

const HomeProfileCard = (props) => {
  const userId = useSelector((state) => state.userId);
  const profilePicture = useSelector((state) => state.profilePicture);
  const [isLoadingPicture, setIsLoadingPicture] = useState(true);

  const { getProfilePicture } = useFirebaseStorage();

  const profilePictureHandler = () => {
    //renders box display according to profilepicture state

    if (isLoadingPicture) {
      return <Spinner />;
    }
    return (
      <div className={styles["img-container"]}>
        <Avatar
          sx={{ width: 200, height: 200 }}
          src={profilePicture}
          alt="avt"
        />
      </div>
    );
  };

  const syncProfilePicture = async () => {
    // gets profile pic, sets in redux
    await getProfilePicture(userId);
    setIsLoadingPicture(false);
  };

  useEffect(() => {
    syncProfilePicture();
  }, []);

  return (
    <Card sx={{ bgcolor: "primary.main" }} className={styles.card}>
      <section className={styles.header}>
        <Paper sx={{ bgcolor: "primary.light" }} className={styles.box}>
          {profilePictureHandler()}
        </Paper>
      </section>
      <section className={styles.data}>
        <div className={styles.id}>
          {props.store.data.name} {props.store.data.surname}
        </div>
        <p>Following</p>
        <p>{props.store.following.length}</p>
        <p>Followers</p>
        <p>{props.store.followers.length}</p>
        <div className={styles.link}>
          <NavLink to={`/profile/${userId}`}>View profile</NavLink>
        </div>
      </section>
    </Card>
  );
};

export default HomeProfileCard;
