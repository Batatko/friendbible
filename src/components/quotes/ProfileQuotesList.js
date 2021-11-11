import { useEffect, Fragment } from "react";
import { useSelector } from "react-redux";

import styles from "./ProfileQuotesList.module.css";
import StatusCard from "../cards/StatusCard";
import QuoteCard from "../cards/QuoteCard";
import Spinner from "../UI/Spinner";

import { Card } from "@mui/material";

const ProfileQuotesList = (props) => {
  const userId = useSelector((state) => state.userId);

  const quoteCardHandler = () => {
    //If userId equals profileId, quote post avaiable
    if (userId === props.profileId) {
      return (
        <QuoteCard
          userData={props.userData}
          postsHandler={props.postsHandler}
          profileId={props.profileId}
        />
      );
    }
  };

  useEffect(() => {
    props.postsHandler();
  }, [props.currentPage]);

  return (
    <Fragment>
      {props.isLoadingUser ? <Spinner /> : quoteCardHandler()}

      {props.isLoadingQuotes ? (
        <Spinner />
      ) : (
        props.limitQuotesData.map((item) => (
          <StatusCard
            key={item.quoteId}
            isProfile={true}
            data={item}
            deleteQuoteHandler={(e) =>
              props.deleteQuoteHandler(e, item.userId, item.quoteId)
            }
            commentStats={props.commentStats}
            likesStats={props.likesStats}
            onClick={() => props.openModalStatus(item.quoteId)}
          />
        ))
      )}

      {!props.isLoadingQuotes && props.limitQuotesData.length === 0 && (
        <Card
          sx={{ bgcolor: "primary.main", elevation: 1 }}
          className={styles.card}
        >
          Share your wisdom!
        </Card>
      )}
    </Fragment>
  );
};

export default ProfileQuotesList;
