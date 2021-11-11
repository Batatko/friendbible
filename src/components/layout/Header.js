import { useRef, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { debounce } from "debounce";
import { disablePageScroll, enablePageScroll } from "scroll-lock";
import useHide from "../hooks/useHide";

import useFirestoreData from "../hooks/useFirestoreData";

import styles from "./Header.module.css";
import logo from "../../assets/logo/default-monochrome.svg";
import SearchModalCard from "../cards/SearchModalCard";

import { Paper } from "@mui/material";

const Header = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.userId);
  const isLogged = useSelector((state) => state.idToken);

  const { getUsers, getFriends } = useFirestoreData();

  const [enteredText, setEnteredText] = useState("");
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [results, setResults] = useState([]);
  const [followingData, setFollowingData] = useState([]);

  const modalRef = useRef(null);

  const [isModal, setIsModal] = useHide(
    modalRef,
    enablePageScroll(modalRef.current)
  );

  //DATA HANDLERS

  const getFriendsList = async () => {
    if (!!isLogged) {
      const friends = await getFriends(userId);
      setFollowingData(friends.following);
    }
  };

  const getUsersHandler = async (inputText) => {
    setIsLoadingSearch(true);

    const users = await getUsers(inputText);
    /// user.userId

    if (users) {
      const list = [];
      for (let user of users) {
        if (followingData.includes(user.userId)) {
          list.push({
            data: user,
            following: true,
          });
        } else {
          list.push({
            data: user,
            following: false,
          });
        }
      }

      setResults(list);
    }

    setIsLoadingSearch(false);
  };

  //TOOLS
  const logOutHandler = () => {
    localStorage.removeItem("refreshToken");
    dispatch({ type: "logout" });
  };

  const inputHandler = (e) => {
    modalTextHandler(e);
    debounce(getUsersHandler(e.target.value), 2000);
  };

  const modalTextHandler = (e) => {
    setEnteredText(e.target.value);

    if (!isModal && e.target.value.length > 0) {
      openModal(e);
    }
    if (isModal && e.target.value.length === 0) {
      closeModal(e);
    }
  };

  const foundUserHandler = () => {
    //set text not working...!!!
    setEnteredText("");

    closeModal();
  };

  const openModal = (e) => {
    setIsModal(e);
    disablePageScroll(modalRef.current);
  };

  const closeModal = () => {
    setIsModal(null);
    enablePageScroll(modalRef.current);
  };

  useEffect(() => {
    getFriendsList();
  }, [isLoadingSearch]);

  return (
    <Paper
      sx={{ bgcolor: "primary.main", borderRadius: 0 }}
      className={styles.header}
    >
      <picture className={styles.logo}>
        <NavLink to="/home">
          <img src={logo} alt="logo" />
        </NavLink>
      </picture>

      <form className={styles.search}>
        {isLogged && (
          <label htmlFor="search_friends" type="text">
            <input
              id="search_friends"
              autoComplete="off"
              value={enteredText}
              onChange={inputHandler}
            />
          </label>
        )}
        <div className={styles["modal-wrapper"]}>
          <div ref={modalRef} className={styles.modal}>
            {isModal && (
              <SearchModalCard
                foundUserHandler={foundUserHandler}
                isLoadingSearch={isLoadingSearch}
                results={results}
              />
            )}
          </div>
        </div>
      </form>

      {isLogged && (
        <ul>
          <li>
            <NavLink to="/home">Home</NavLink>
          </li>
          <li>
            <NavLink to="/messages">Messages</NavLink>
          </li>
          <li>
            <NavLink to={`/profile/${userId}`}>Profile</NavLink>
          </li>
          <li>
            <p onClick={logOutHandler}>Logout</p>
          </li>
        </ul>
      )}
    </Paper>
  );
};

export default Header;
