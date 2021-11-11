import { useState, useEffect, Fragment } from "react";
import { useSelector } from "react-redux";

import useFirestoreData from "../hooks/useFirestoreData";
import useFirebaseData from "../hooks/useFiresbaseData";

import styles from "./Home.module.css";
import Feed from "../layout/Feed";
import HomeProfileCard from "../cards/HomeProfileCard";
import Spinner from "../UI/Spinner";
import AdsList from "../ads/AdsList";
import HomeQuotesList from "../quotes/HomeQuotesList";
import ModalStatusCard from "../cards/ModalStatusCard";
import ShareModalCard from "../cards/ShareModalCard";
import StatusCard from "../cards/StatusCard";

import Pagination from "../tools/Pagination";

import { Modal } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const Home = () => {
  const userId = useSelector((state) => state.userId);

  const { deleteComments, getCommentsStats, getLikesStats, deleteLikes } =
    useFirebaseData();
  const { getQuotes, deleteQuote, getShare, deleteShare, getUserData, getFriends } =
    useFirestoreData();

  const [isLoadingUser, setIsloadingUser] = useState(true);
  const [userData, setUserData] = useState({
    data: "",
    following: "",
    followers: "",
  });

  const [isLoadingQuotes, setIsLoadingQuotes] = useState(true);
  const [quotesData, setQuotesData] = useState([]);
  const [limitQuotesData, setLimitQuotesData] = useState([]);

  const [commentStats, setCommentStats] = useState([]);
  const [likesStats, setLikesStats] = useState([]);

  const [openQuote, setOpenQuote] = useState(false);
  const handleOpenQuote = () => setOpenQuote(true);
  const handleCloseQuote = () => setOpenQuote(false);

  const [openShare, setOpenShare] = useState(false);
  const handleOpenShare = () => setOpenShare(true);
  const handleCloseShare = () => setOpenShare(false);

  const [selectedQuoteData, setSelectedQuoteData] = useState("");
  const [selectedShareData, setSelectedShareData] = useState("");

  //PAGINATION LOGIC
  const MAX_POSTS = 5;

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(MAX_POSTS);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;

  const pageHandler = (direction) => {
    const maxPage = Math.ceil(quotesData.length / postsPerPage);
    if (direction === "left" && currentPage > 1) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setCurrentPage(currentPage - 1);
    } else if (direction === "right" && currentPage < maxPage) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setCurrentPage(currentPage + 1);
    }
  };

  //Change Page
  const paginate = (pageNum) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setCurrentPage(pageNum);
  };

  //DATA HANDLERS
  const userDataHandler = async () => {
    setIsloadingUser(true);
    const data = await getUserData();
    const friends = await getFriends();

    setUserData({
      data: data,
      following: friends.following,
      followers: friends.followers,
    });
    setIsloadingUser(false);
  };

  const postsHandler = async () => {
    //Gets quotes data and sets quotesData state
    setIsLoadingQuotes(true);
    const quotes = await getQuotes();

    //Set all quotes data
    setQuotesData(quotes);

    //Set Pagination according to index of first and last post
    setLimitQuotesData(quotes.slice(indexOfFirstPost, indexOfLastPost));

    setIsLoadingQuotes(false);
  };

  const getCommentsStatsHandler = async () => {
    // gets comment stats, handles data if response null
    const resData = await getCommentsStats();
    if (resData === null) {
      setCommentStats([]);
      return [];
    }
    setCommentStats(resData);
    return resData;
  };

  const getLikesStatsHandler = async () => {
    // gets like stats, handles data if response null
    const resData = await getLikesStats();
    if (resData === null) {
      setLikesStats([]);
      return [];
    }
    setLikesStats(resData);
    return resData;
  };

  const deleteQuoteHandler = async (e, quoteOwner, quoteId) => {
    //Prevents propagation onClick (Delete dropMenu)
    //checks if userId equal to quoteId, deletes quote and related comments and likes from Firestore
    e.stopPropagation();
    if (userId === quoteOwner) {
      await deleteQuote(quoteId);
      await deleteComments(quoteId);
      await deleteLikes(quoteId);

      //If quote shared, deletes shareQuote
      const shareId = await getShare(quoteId);
      if (!!shareId) {
       await deleteShare(shareId);
      }

      postsHandler();
    }
  };

  const deleteShareHandler = async (e, shareOwner, shareId) => {
    e.stopPropagation();
    if (userId === shareOwner) {
      await deleteShare(shareId);
      postsHandler();
    }
  };

  //QUOTE CARD MODAL
  const openModalStatus = async (quoteId, share = false) => {
    // disablePageScroll(modalRef.current);

    if (!share) {
      handleOpenQuote();
      for (let item of quotesData) {
        if (!item.share && item.quoteId === quoteId) {
          setSelectedQuoteData(
            <ModalStatusCard
              key={item.quoteId}
              quoteId={item.quoteId}
              userData={userData}
              quoteData={item}
              quoteLikes={likesStats[item.quoteId]}
              closeModal={closeModal}
              getCommentsStatsHandler={getCommentsStatsHandler}
              getLikesStatsHandler={getLikesStatsHandler}
            />
          );
        }
      }
    }

    if (share) {
      handleOpenShare();
      for (let item of quotesData) {
        if (item.quoteId === quoteId) {
          setSelectedShareData(
            <ShareModalCard
              userData={userData}
              quoteId={item.quoteId}
              closeModal={closeModal}
              postsHandler={postsHandler}
            >
              <StatusCard
                key={item.quoteId}
                isShare={true}
                data={item}
                commentStats={commentStats}
                likesStats={likesStats}
              />
            </ShareModalCard>
          );
        }
      }
    }
  };

  const closeModal = () => {
    handleCloseQuote();
    handleCloseShare();
  };

  useEffect(() => {
    userDataHandler();
    getCommentsStatsHandler();
    getLikesStatsHandler();
  }, []);

  return (
    <Fragment>
      <Modal
        className={styles.modal}
        open={openShare}
        onClose={handleCloseShare}
      >
        {selectedShareData}
      </Modal>

      <Modal
        className={styles.modal}
        open={openQuote}
        onClose={handleCloseQuote}
      >
        {selectedQuoteData}
      </Modal>

      <Feed className={styles.feed}>
        <div className={styles.left}>
          {isLoadingUser ? <Spinner /> : <HomeProfileCard store={userData} />}
          <AdsList quantity={2} />
        </div>
        <div className={styles.middle}>
          <HomeQuotesList
            //data
            userData={userData}
            limitQuotesData={limitQuotesData}
            quotesData={quotesData}
            commentStats={commentStats}
            likesStats={likesStats}
            currentPage={currentPage}
            IsloadingUser={setIsloadingUser}
            isLoadingQuotes={isLoadingQuotes}
            postsHandler={postsHandler}
            deleteQuoteHandler={deleteQuoteHandler}
            deleteShareHandler={deleteShareHandler}
            openModalStatus={openModalStatus}
          />

          <div className={styles["pagination-container"]}></div>
        </div>
        <div className={styles.right}>
          <AdsList quantity={5} />
        </div>
      </Feed>

      <div className={styles["pagination-container"]}>
        <ArrowBackIosNewIcon
          fontSize="large"
          className={styles.arrow}
          onClick={() => pageHandler("left")}
        />
        <Pagination
          postsPerPage={postsPerPage}
          totalPosts={quotesData.length}
          currentPage={currentPage}
          paginate={paginate}
        ></Pagination>
        <ArrowForwardIosIcon
          fontSize="large"
          className={styles.arrow}
          onClick={() => pageHandler("right")}
        />
      </div>
    </Fragment>
  );
};

export default Home;
