import { Fragment, useEffect } from "react";

import styles from "./HomeQuotesList.module.css";
import StatusCard from "../cards/StatusCard";
import ShareCard from "../cards/ShareCard";
import QuoteCard from "../cards/QuoteCard";
import Spinner from "../UI/Spinner";

import { Card } from "@mui/material";

const HomeQuotesList = (props) => {
  const quoteCardHandler = () => {
    return (
      <QuoteCard userData={props.userData} postsHandler={props.postsHandler} />
    );
  };

  useEffect(() => {
    props.postsHandler();
  }, [props.currentPage]);

  const renderQuoteData = () => {
    //Sorts statusQuote from shareQuotes and renders according to type

    /// getting error on share button!!!!!!!!
    let quotesData = [];
    for (const item of props.limitQuotesData) {
      if (Object.keys(item).includes("share")) {
        let filteredQuote;
        for (const subQuote of props.quotesData) {
          if (subQuote.quoteId === item.quoteId) {
            filteredQuote = subQuote;
          }
        }

        quotesData.push(
          <ShareCard
            key={item.shareId}
            data={item}
            userData={props.userData}
            deleteShareHandler={props.deleteShareHandler}
            isShare={true}
          >
            <StatusCard
              key={item.quoteId}
              data={filteredQuote}
              commentStats={props.commentStats}
              likesStats={props.likesStats}
              isShare={true}
              onClick={() => props.openModalStatus(item.quoteId)}
            />
          </ShareCard>
        );
      } else {
        quotesData.push(
          <StatusCard
            key={item.quoteId}
            data={item}
            deleteQuoteHandler={props.deleteQuoteHandler}
            commentStats={props.commentStats}
            likesStats={props.likesStats}
            openModalStatus={props.openModalStatus}
            onClick={() => props.openModalStatus(item.quoteId)}
          />
        );
      }
    }
    return quotesData;
  };

  return (
    <Fragment>
      {props.isLoadingUser ? <Spinner /> : quoteCardHandler()}

      {props.isLoadingQuotes ? <Spinner /> : renderQuoteData()}

      {!props.isLoadingQuotes && props.quotesData.length === 0 && (
        <Card
          sx={{ bgcolor: "primary.main", elevation: 1 }}
          className={styles.card}
        >
          Get this Bible going!
        </Card>
      )}
    </Fragment>
  );
};

export default HomeQuotesList;
