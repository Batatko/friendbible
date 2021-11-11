import { useState } from "react";
import { useSelector } from "react-redux";

import useFirestoreData from "../hooks/useFirestoreData";

import styles from "./QuoteCard.module.css";

import { Card } from "@mui/material";
import { Button } from "@mui/material";

const QuoteCard = (props) => {
  const { addQuote } = useFirestoreData();
  const [enteredInput, setEnteredInput] = useState("");
  const userId = useSelector((state) => state.userId);
  const profileId = props.profileId;

  const quotePostHandler = async (e) => {
    e.preventDefault();
    if (!enteredInput) {
      return;
    }
    await addQuote({
      userId: userId,
      text: enteredInput,
      user: {
        name: props.userData.data.name,
        surname: props.userData.data.surname,
      },
    });
    props.postsHandler(profileId);
    setEnteredInput("");
  };

  return (
    <Card
      sx={{ bgcolor: "primary.main", elevation: 1 }}
      className={styles.card}
    >
      <form id="quote" onSubmit={quotePostHandler}>
        <label htmlFor="quote-input">
          <textarea
            id="quote-input"
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
          form="quote"
        >
          Post
        </Button>
      </form>
    </Card>
  );
};

export default QuoteCard;
