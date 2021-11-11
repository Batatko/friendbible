import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

import useFirebaseStorage from "../../hooks/useFirebaseStorage";

import styles from "./SearchItem.module.css";
import Spinner from "../../UI/Spinner";

import { Card } from "@mui/material";
import { Box } from "@mui/system";
import { Avatar } from "@mui/material";

const SearchItem = (props) => {
  const { getProfilePicture } = useFirebaseStorage();

  const [isLoadingPicture, setIsLoadingPicture] = useState(true);
  const [profilePicture, setProfilePicture] = useState("");

  const syncProfilePicture = async () => {
    //gets profile pic, sets in redux
    const link = await getProfilePicture(props.user.data.userId, false);

    setProfilePicture(link);
    setIsLoadingPicture(false);
  };

  useEffect(() => {
    syncProfilePicture();
  }, []);

  return (
    <NavLink
      to={`/profile/${props.user.data.userId}`}
      className={styles["menu-item"]}
    >
      <Card
        sx={{ bgcolor: "primary.main", elevation: 1 }}
        className={styles.card}
        onClick={props.foundUserHandler}
      >
        <Box className={styles.box}>
          {" "}
          <div className={styles["avatar-container"]}>
            {isLoadingPicture && <Spinner className={styles.spin} />}
            {!isLoadingPicture && (
              <Avatar
                sx={{ width: 50, height: 50 }}
                src={profilePicture}
                alt="avt"
              />
            )}
          </div>
        </Box>

        <div className={styles["user-info"]}>
          <p
            className={styles.user}
          >{`${props.user.data.name} ${props.user.data.surname}`}</p>
          <p className={styles.following}>
            {props.user.following && "Following"}
          </p>
        </div>
      </Card>
    </NavLink>
  );
};

export default SearchItem;
