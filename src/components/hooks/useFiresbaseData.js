import { firebaseApp } from "../../firebase_init";
import { Timestamp } from "firebase/firestore";
import {
  getDatabase,
  child,
  get,
  ref,
  remove,
  update,
  push,
  onChildAdded,
} from "firebase/database";

const useFirebaseData = () => {
  const firebase = getDatabase(firebaseApp);

  //////////////////////////////////////
  // Chat requests
  //////////////////////////////////////

  const deleteChat = async (chatId) => {
    const chatRef = ref(firebase, "chats/" + chatId);
    await remove(chatRef);
  };

  const getChatMessages = (chatId, cb) => {
    const chatRef = ref(firebase, "chats/" + chatId);

    if (chatId) {
      const unsubscribe = onChildAdded(chatRef, (snapshot) => {
        const data = snapshot.val();
        cb({
          messageId: snapshot.key,
          data: data,
        });
      });

      return unsubscribe;
    }
  };

  const sendMessage = async (chatId, ownerName, ownerId, message) => {
    const newMessageId = push(child(ref(firebase), "chats/" + chatId)).key;

    await update(ref(firebase, "chats/" + chatId), {
      [newMessageId]: {
        time: Timestamp.fromDate(new Date()),
        ownerId: ownerId,
        ownerName: ownerName,
        message: message,
      },
    });
  };

  //////////////////////////////////////
  // Comment requests
  //////////////////////////////////////

  const getComments = async (quoteId, cb) => {
    //gets comments data for the given quoteId

    const chatRef = ref(firebase, "comments/" + quoteId);

    const unsubscribe = onChildAdded(chatRef, (snapshot) => {
      const data = snapshot.val();
      cb({
        messageId: snapshot.key,
        data: data,
      });
    });

    return unsubscribe;
  };

  const deleteComments = async (quoteId) => {
    const commentRef = ref(firebase, "comments/" + quoteId);
    await remove(commentRef);
  };

  const getCommentsStats = async () => {
    //gets comments Id's with their comments count

    const dbRef = ref(firebase);
    const response = await get(child(dbRef, "comments/"));
    const data = await response.val();
    if (data) {
      return data;
    }
    return null;
  };

  const postComment = async (commentOwner, quoteId, comment) => {
    //posts comment in database with given parameters
    const newCommentId = push(child(ref(firebase), "comments/" + quoteId)).key;

    await update(ref(firebase, "comments/" + quoteId), {
      [newCommentId]: {
        time: Timestamp.fromDate(new Date()),
        ownerName: commentOwner,
        message: comment,
      },
    });
  };

  //////////////////////////////////////
  // Like requests
  //////////////////////////////////////

  const getLikesStats = async () => {
    const dbRef = ref(firebase);
    const response = await get(child(dbRef, "likes/"));
    const data = await response.val();

    if (data) {
      return data;
    }
    return null;
  };

  const likeQuote = async (quoteId, userId) => {
    await update(ref(firebase, "likes/" + quoteId), {
      [userId]: {
        time: Timestamp.fromDate(new Date()),
      },
    });
  };

  const unlikeQuote = async (quoteId, userId) => {
    await update(ref(firebase, "likes/" + quoteId), {
      [userId]: null,
    });
  };

  const deleteLikes = async (quoteId) => {
    const likesRef = ref(firebase, "likes/" + quoteId);
    await remove(likesRef);
  };

  return {
    sendMessage,
    getChatMessages,
    deleteChat,
    getCommentsStats,
    getComments,
    deleteComments,
    postComment,
    getLikesStats,
    likeQuote,
    unlikeQuote,
    deleteLikes
  };
};

export default useFirebaseData;
