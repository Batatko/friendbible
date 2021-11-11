import { useDispatch } from "react-redux";

import { firebaseApp } from "../../firebase_init";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";

const useFirebaseStorage = () => {
  const dispatch = useDispatch();
  const firebase = getStorage(firebaseApp);

  const listFiles = async () => {
    const list = [];

    // Create a reference under which you want to list
    const listRef = ref(firebase, "profile_pictures");

    // Find all items.
    await listAll(listRef)
      .then((res) => {
        res.items.forEach((item) => {
          list.push(item.name);
        });
      })
      .catch((error) => {
        console.log(error);
      });

    return list;
  };

  const deleteProfilePicture = async (userId) => {
    //deletes picture from Storage according to userId

    // Create a reference to the file to delete
    const desertRef = ref(firebase, "profile_pictures/" + userId);

    // Delete the file
    await deleteObject(desertRef)
      .then(() => {
        console.log("File deleted successfully");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const uploadProfilePicture = async (userId, file) => {
    //upload picture in Firestore Storage as userid name, sets link in redux

    const storageRef = ref(firebase, "profile_pictures/" + userId);
    await uploadBytes(storageRef, file).then(() => {
      console.log("File uploaded!");
    });
    const link = await getDownloadURL(storageRef);
    dispatch({
      type: "setProfilePicture",
      payload: {
        link: link,
      },
    });
  };

  const getProfilePicture = async (userId, setGlobal = true) => {
    //gets profile picture for userId , sets link in redux

    const pictureFiles = await listFiles();
    let ID = "";
    if (pictureFiles.includes(userId)) {
      ID = userId;
    } else {
      ID = "profile.svg";
    }

    const storageRef = ref(firebase, "profile_pictures/" + ID);
    const link = await getDownloadURL(storageRef);

    if (setGlobal) {
      dispatch({
        type: "setProfilePicture",
        payload: {
          link: link,
        },
      });
      return;
    }
    return link;
  };

  return {
    uploadProfilePicture,
    deleteProfilePicture,
    listFiles,
    getProfilePicture,
  };
};

export default useFirebaseStorage;
