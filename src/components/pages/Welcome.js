import { NavLink } from "react-router-dom";

import styles from "./Welcome.module.css";
import Feed from "../layout/Feed";

import { Card } from "@mui/material";

const Welcome = () => {
  return (
    <Feed className={styles.feed}>
      <Card className={styles.card}>
        <p>Welcome!</p>
        <NavLink to="/login"> Join the Bible!</NavLink>
      </Card>
    </Feed>
  );
};

export default Welcome;
