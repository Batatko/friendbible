import { useState, useEffect, Fragment } from "react";

import useFirebaseData from "../hooks/useFiresbaseData";

import styles from "./Like.module.css";
import { Button } from "@mui/material";

const Like = (props) => {
  const { likeQuote, unlikeQuote } = useFirebaseData();
  const [isLike, setIsLike] = useState(false);

  const checkIsLike = () => {
    if (props.quoteLikes) {
      const state = Object.keys(props.quoteLikes).includes(props.userId);
      setIsLike(state);
    }
  };

  const likeHandler = async () => {
    if (!isLike) {
      await likeQuote(props.quoteId, props.userId);
      setIsLike(true);
    } else {
      await unlikeQuote(props.quoteId, props.userId);
      setIsLike(false);
    }

    await props.getLikesStatsHandler();
  };

  useEffect(() => {
    checkIsLike();
  }, []);

  return (
    <Fragment>
      <Button
        sx={{ fontSize: "15px", fontWeight: "550" }}
        className={styles.like}
        variant="contained"
        color={"secondary"}
        onClick={likeHandler}
      >
        {isLike ? "Unlike" : "Like"}
      </Button>
    </Fragment>
  );
};

export default Like;
