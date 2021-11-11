import { useState, useEffect, Fragment } from "react";

import styles from "./AdsList.module.css";
import ImageConfig from "../config/ImageConfig";
import Spinner from "../UI/Spinner";

import { Card } from "@mui/material";

const AdsList = (props) => {
  const [uniqueList, setUniqueList] = useState([]);
  const [isLoading, setIsloading] = useState(true);

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function getIndexList() {
    let indexList = [];

    while (indexList.length !== props.quantity) {
      const num = getRandomInt(ImageConfig.length);
      indexList.push(num);
      indexList = [...new Set(indexList)];
    }
    setUniqueList([...indexList]);
    setIsloading(false);
  }

  useEffect(() => {
    if (uniqueList.length === 0) {
      getIndexList();
    }
  });

  return (
    <Fragment>
      {isLoading ? (
        <Spinner />
      ) : (
        uniqueList.map((i) => (
          <Card sx={{bgcolor: "primary.main" }} key={i} className={styles.card}>
            <div
              className={styles["image-container"]}
            >
              <img src={ImageConfig[i]} alt="ads" />
            </div>
          </Card>
        ))
      )}
    </Fragment>
  );
};

export default AdsList;
