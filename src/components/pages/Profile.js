import { useEffect, useState, Fragment } from "react";
import { useParams } from "react-router";
import { useSelector } from "react-redux";

import useFirestoreData from "../hooks/useFirestoreData";
import useFirebaseData from "../hooks/useFiresbaseData";

import styles from "./Profile.module.css";
import Feed from "../layout/Feed";
import AdsList from "../ads/AdsList";
import ProfileCard from "../cards/ProfileCard";
import ProfileQuotesList from "../quotes/ProfileQuotesList";
import ProfileImageModal from "../cards/ProfileImageModal";
import ModalStatusCard from "../cards/ModalStatusCard";

import Pagination from "../tools/Pagination";

import { Modal } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const Profile = () => {
  const params = useParams();
  const { profileId } = params;
  const userId = useSelector((state) => state.userId);

  const { deleteComments, getCommentsStats, getLikesStats, deleteLikes } =
    useFirebaseData();
  const {
    getQuerryQuotes,
    deleteQuote,
    getUserData,
    getFriends,
    addFollower,
    removeFollower,
    getShare,
    deleteShare
  } = useFirestoreData();

  const [isLoadingPicture, setIsLoadingPicture] = useState(false);

  const [isPictureModal, setIsPictureModal] = useState(false);
  const handleOpenPicture = () => setIsPictureModal(true);
  const handleClosePicture = () => setIsPictureModal(false);

  const [isQuoteModal, setIsQuoteModal] = useState(false);
  const handleOpenQuote = () => setIsQuoteModal(true);
  const handleCloseQuote = () => setIsQuoteModal(false);
  const [selectedQuoteData, setSelectedQuoteData] = useState("");

  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingUser, setIsloadingUser] = useState(true);

  const [isLoadingQuotes, setIsLoadingQuotes] = useState(true);
  const [quotesData, setQuotesData] = useState("");
  const [limitQuotesData, setLimitQuotesData] = useState([]);

  const [commentStats, setCommentStats] = useState([]);
  const [likesStats, setLikesStats] = useState([]);

  const [profileData, setProfileData] = useState({
    data: "",
    following: "",
    followers: "",
  });
  const [userData, setUserData] = useState({
    data: "",
    following: "",
    followers: "",
  });

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

  // DATA HANDLERS
  const profileDataHandler = async () => {
    const profileData = await getUserData(profileId);
    const profileFriends = await getFriends(profileId);

    setProfileData({
      data: profileData,
      following: profileFriends.following,
      followers: profileFriends.followers,
    });
  };

  const userDataHandler = async () => {
    setIsloadingUser(true);

    //If not on userid profile, fetch profileId data
    if (userId !== profileId) {
      await profileDataHandler();
    }

    const currUserData = await getUserData(userId);
    const currUserFriends = await getFriends(userId);

    setUserData({
      data: currUserData,
      following: currUserFriends.following,
      followers: currUserFriends.followers,
    });
    setIsFollowing(!!currUserFriends.following.includes(profileId));
    setIsloadingUser(false);
  };

  const addFollowerHandler = async (id) => {
    await addFollower(id);
    const currUserFriends = await getFriends(userId);
    setUserData((prevState) => ({
      ...prevState,
      following: currUserFriends.following,
      followers: currUserFriends.followers,
    }));

    const profileUserFriends = await getFriends(profileId);
    setProfileData((prevState) => ({
      ...prevState,
      following: profileUserFriends.following,
      followers: profileUserFriends.followers,
    }));

    setIsFollowing(!!currUserFriends.following.includes(profileId));
  };

  const removeFollowerHandler = async (id) => {
    await removeFollower(id);
    const currUserFriends = await getFriends(userId);
    setUserData((prevState) => ({
      ...prevState,
      following: currUserFriends.following,
      followers: currUserFriends.followers,
    }));

    const profileUserFriends = await getFriends(profileId);
    setProfileData((prevState) => ({
      ...prevState,
      following: profileUserFriends.following,
      followers: profileUserFriends.followers,
    }));

    setIsFollowing(!!currUserFriends.following.includes(profileId));
  };

  const postsHandler = async () => {
    //Gets quotes data and sets quotesData state depending on Id

    setIsLoadingQuotes(true);

    let quotes;
    if (userId === profileId) {
      quotes = await getQuerryQuotes(userId);
    } else {
      quotes = await getQuerryQuotes(profileId);
    }

    //Set all quotes data
    setQuotesData(quotes);

    //Set Pagination according to index of first and last post
    setLimitQuotesData(quotes.slice(indexOfFirstPost, indexOfLastPost));

    setIsLoadingQuotes(false);
  };

  const deleteQuoteHandler = async (e, quoteUser, quoteId) => {
    //Prevents propagation onClick (Delete dropMenu)
    //checks if userId equal to quoteId, deletes quote from Firestore
    //and related comments data in Firebase
    e.stopPropagation();
    if (userId === quoteUser) {
      await deleteComments(quoteId);
      await deleteQuote(quoteId);
      await deleteLikes(quoteId);

      //If quote shared, deletes shareQuote
      const shareId = await getShare(quoteId);
      if (!!shareId) {
        await deleteShare(shareId);
      }

      postsHandler();
    }
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

  // QUOTE CARD MODAL
  const openModalStatus = async (quoteId) => {
    handleOpenQuote();
    for (let item of quotesData) {
      if (item.quoteId === quoteId) {
        setSelectedQuoteData(
          <ModalStatusCard
            key={item.quoteId}
            //Data
            userData={userData}
            quoteId={item.quoteId}
            quoteData={item}
            quoteLikes={likesStats[item.quoteId]}
            closeModal={handleCloseQuote}
            getCommentsStatsHandler={getCommentsStatsHandler}
            getLikesStatsHandler={getLikesStatsHandler}
          />
        );
      }
    }
  };

  //RENDER
  const quoteListHandler = () => {
    if (userId === profileId) {
      //Loads userId quotes
      return (
        <ProfileQuotesList
          profileId={userId}
          userData={userData}
          quotesData={quotesData}
          limitQuotesData={limitQuotesData}
          commentStats={commentStats}
          likesStats={likesStats}
          postsHandler={postsHandler}
          IsloadingUser={setIsloadingUser}
          isLoadingQuotes={isLoadingQuotes}
          deleteQuoteHandler={deleteQuoteHandler}
          openModalStatus={openModalStatus}
          currentPage={currentPage}
        />
      );
    } else {
      //Loads profileId quotes
      return (
        <ProfileQuotesList
          profileId={profileId}
          userData={profileData}
          quotesData={quotesData}
          limitQuotesData={limitQuotesData}
          commentStats={commentStats}
          likesStats={likesStats}
          postsHandler={postsHandler}
          IsloadingUser={setIsloadingUser}
          isLoadingQuotes={isLoadingQuotes}
          currentPage={currentPage}
          deleteQuoteHandler={deleteQuoteHandler}
          openModalStatus={openModalStatus}
        />
      );
    }
  };

  // TOOLS
  const pictureModalHandler = () => {
    // If userId is equal to profileId allow pictureImageModal
    if (isPictureModal && userId === profileId) {
      return (
        <Modal
          className={styles.modal}
          open={isPictureModal}
          onClose={handleClosePicture}
        >
          <ProfileImageModal
            userId={userId}
            isLoadingPicture={isLoadingPicture}
            setIsLoadingPicture={setIsLoadingPicture}
            closeModal={handleClosePicture}
          />
        </Modal>
      );
    }
  };

  useEffect(() => {
    userDataHandler();
    getCommentsStatsHandler();
    getLikesStatsHandler();
  }, [profileId]);

  return (
    <Fragment>
      {pictureModalHandler()}

      <Modal
        className={styles.modal}
        open={isQuoteModal}
        onClose={handleCloseQuote}
      >
        {selectedQuoteData}
      </Modal>

      <ProfileCard
        userId={userId}
        profileId={profileId}
        userData={userData}
        profileData={profileData}
        handleOpenPicture={handleOpenPicture}
        setIsLoadingPicture={setIsLoadingPicture}
        isLoadingPicture={isLoadingPicture}
        isLoadingUser={isLoadingUser}
        isFollowing={isFollowing}
        removeFollowerHandler={removeFollowerHandler}
        addFollowerHandler={addFollowerHandler}
      />

      <Feed className={styles.feed}>
        <div className={styles.left}>
          <AdsList
            quantity={
              limitQuotesData.length <= 4
                ? limitQuotesData.length + 3
                : limitQuotesData.length - 3
            }
          />
        </div>
        <div className={styles.middle}>{quoteListHandler()}</div>
        <div className={styles.right}>
          <AdsList
            quantity={
              limitQuotesData.length <= 4
                ? limitQuotesData.length + 3
                : limitQuotesData.length - 3
            }
          />
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

export default Profile;
