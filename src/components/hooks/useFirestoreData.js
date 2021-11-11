import { useSelector } from "react-redux";

import useRefreshState from "./useRefreshState";

import { firebaseApp } from "../../firebase_init";
import {
  getFirestore,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  collection,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

const useFirestoreData = () => {
  const firestore = getFirestore(firebaseApp);
  const { getUserId } = useRefreshState();
  const userId = useSelector((state) => state.userId);

  //////////////////////////////////////
  //USER DATA
  //////////////////////////////////////
  const getUser = async () => {
    // gets UserId with getUserId refresh hook
    if (!userId) {
      return await getUserId();
    }
    return userId;
  };

  const getUserData = async (id = null) => {
    // gets userData from firestore
    const userId = id ? id : await getUser();
    const user = await getDoc(doc(firestore, "users", userId));
    if (user.exists()) {
      return user.data();
    }
  };

  const addFollower = async (id) => {
    // updates followers
    const userId = await getUser();
    const followingRef = doc(firestore, "friends", `${userId}`);
    const followerRef = doc(firestore, "friends", `${id}`);
    await updateDoc(followingRef, {
      following: arrayUnion(id),
    });

    await updateDoc(followerRef, {
      followers: arrayUnion(userId),
    });
  };

  const removeFollower = async (id) => {
    //updates followers
    const userId = await getUser();
    const followingRef = doc(firestore, "friends", `${userId}`);
    const followerRef = doc(firestore, "friends", `${id}`);
    await updateDoc(followingRef, {
      following: arrayRemove(id),
    });

    await updateDoc(followerRef, {
      followers: arrayRemove(userId),
    });
  };

  const getFriends = async (id = null) => {
    // gets firends following userid
    const userId = id ? id : await getUser();
    const friends= await getDoc(doc(firestore, `friends`, userId));

    return friends.data();
  };

  const getUsers = async (inputText) => {
    //Gets all Users data
    const usersNameRef = query(
      collection(firestore, "users"),
      where("name", "==", inputText)
    );

    const usersSurnameRef = query(
      collection(firestore, "users"),
      where("surname", "==", inputText)
    );

    const usersNameRefSnapshot = await getDocs(usersNameRef);
    const usersSurnameRefSnapshot = await getDocs(usersSurnameRef);

    const usersNameList = [];
    const usersSurnameList = [];

    if (usersNameRefSnapshot) {
      usersNameRefSnapshot.forEach((user) => {
        usersNameList.push({
          name: user.data().name,
          surname: user.data().surname,
          userId: user.id,
        });
      });
    }

    if (usersSurnameRefSnapshot) {
      usersSurnameRefSnapshot.forEach((user) => {
        usersSurnameList.push({
          name: user.data().name,
          surname: user.data().surname,
          userId: user.id,
        });
      });
    }

    let usersList = [];
    if (usersNameList.length !== 0) {
      usersList = [...usersNameList];
      return usersList;
    } else {
      usersList = [...usersSurnameList];
      return usersList;
    }
  };

  //////////////////////////////////////
  //QUOTE DATA
  //////////////////////////////////////
  const addQuote = async (data) => {
    // adds new quote to firebase
    const newQuote = await addDoc(collection(firestore, "quotes"), {
      time: Timestamp.fromDate(new Date()),
      userId: data.userId,
      text: data.text,
      user: data.user,
    });

    return newQuote;
  };

  const deleteQuote = async (id) => {
    //deletes quote from firebase
    await deleteDoc(doc(firestore, "quotes", id));
  };

  const getQuotes = async () => {
    // gets quotes from firebase, returns sorted list by date
    let quotes = [];
    const quoteRef = await getDocs(collection(firestore, "quotes"));

    quoteRef.forEach((quote) => {
      quotes.push({
        time: quote.data().time.toDate(),
        userId: quote.data().userId,
        text: quote.data().text,
        user: quote.data().user,
        quoteId: quote.id,
      });
    });

    const shareQuotes = await getShares();
    quotes = [...quotes, ...shareQuotes];

    const quotesSort = quotes.sort((a, b) => b.time - a.time);

    return quotesSort;
  };

  const getQuerryQuotes = async (id) => {
    // gets quotes if owner === id. returns sorted list by date
    const quotes = [];
    const quoteRef = query(
      collection(firestore, "quotes"),
      where("userId", "==", id)
    );
    const quoteRefSnapshot = await getDocs(quoteRef);

    quoteRefSnapshot.forEach((quote) => {
      quotes.push({
        time: quote.data().time.toDate(),
        userId: quote.data().userId,
        text: quote.data().text,
        user: quote.data().user,
        quoteId: quote.id,
      });
    });

    const quotesSort = quotes.sort((a, b) => b.time - a.time);

    return quotesSort;
  };

  //////////////////////////////////////
  //SHARE DATA
  //////////////////////////////////////
  const addShare = async (data) => {
    //Adds shared quote data to Firestore

    await addDoc(collection(firestore, "shares"), {
      time: Timestamp.fromDate(new Date()),
      share: true,
      userId: data.userId,
      quoteId: data.quoteId,
      user: data.user,
    });
  };

  const getShares = async () => {
    const shareQuotes = [];
    const shareQuotesRef = await getDocs(collection(firestore, "shares"));

    shareQuotesRef.forEach((shareQuote) => {
      shareQuotes.push({
        time: shareQuote.data().time.toDate(),
        share: shareQuote.data().share,
        userId: shareQuote.data().userId,
        user: shareQuote.data().user,
        quoteId: shareQuote.data().quoteId,
        shareId: shareQuote.id,
      });
    });

    return shareQuotes;
  };

  const getShare = async (id) => {
    const shareRef = query(
      collection(firestore, "shares"),
      where("quoteId", "==", id)
    );
    const shareRefSnapshot = await getDocs(shareRef);
    
    let shareId;
    shareRefSnapshot.forEach((shareQuote) => {
      shareId = shareQuote.id
    })

    return shareId;
  }

  const deleteShare = async (id) => {
    //deletes share quote from firebase
    await deleteDoc(doc(firestore, "shares", id));
  };

  //////////////////////////////////////
  //CHAT DATA
  //////////////////////////////////////

  const checkIfChatExists = async (friendIds, userChatIds) => {
    //checks if chat already exists between friend and user
    const exists =
      friendIds.filter((id) => userChatIds.includes(id)).length === 0
        ? false
        : true;
    return exists;
  };

  const createChatInfo = async (membersData, membersId, ownerId) => {
    //creates new chatInfo in firestore, and adds chatId to users
    try {
      const chatRef = await addDoc(collection(firestore, "chats"), {
        created: Timestamp.fromDate(new Date()),
        lastMessage: Timestamp.fromDate(new Date()),
        ownerId: ownerId,
        members: { ...membersData },
      });
      const newChat = await getDoc(chatRef);

      for (let i in membersId) {
        await updateDoc(doc(firestore, "users", membersId[i]), {
          chatId: arrayUnion(newChat.id),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const setLastMessageTime = async (chatId) => {
    //sets last message Timestamp

    const chatRef = doc(firestore, "chats", chatId);
    await setDoc(
      chatRef,
      { lastMessage: Timestamp.fromDate(new Date()) },
      { merge: true }
    );
  };

  const deleteChatInfo = async (chatId) => {
    //deletes chat info in firestore, and removes chatId from users
    const chatsData = await getChats();
    let members = [];
    for (let i in chatsData) {
      if (chatsData[i].chatId === chatId) {
        for (let j in chatsData[i].data.members) {
          members.push(j);
        }
      }
    }

    await deleteDoc(doc(firestore, "chats", chatId));

    for (let member of members) {
      const memberRef = doc(firestore, "users", member);
      await updateDoc(memberRef, {
        chatId: arrayRemove(chatId),
      });
    }
  };

  const getChats = async () => {
    // gets chatId's and data
    const chats = [];
    const chatsRef = await getDocs(collection(firestore, "chats"));

    chatsRef.forEach((item) => {
      chats.push({ data: item.data(), chatId: item.id });
    });

    return chats;
  };

  return {
    getUserData,
    addFollower,
    removeFollower,
    getFriends,
    getUsers,
    addQuote,
    getQuotes,
    deleteQuote,
    getQuerryQuotes,
    addShare,
    getShare,
    deleteShare,
    checkIfChatExists,
    createChatInfo,
    setLastMessageTime,
    getChats,
    deleteChatInfo,
  };
};

export default useFirestoreData;
