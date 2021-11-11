import { useDispatch } from "react-redux";

import { firebaseApp } from "../../firebase_init";
import firebase_config from "../../firebase_config"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const useAuthUser = () => {
  const firestore = getFirestore(firebaseApp);
  const dispatch = useDispatch();

  const sendAuthRequest = async (type, userInfo) => {
    if (type === "signIn") {
      await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebase_config.apiKey}`,
        {
          method: "POST",
          body: JSON.stringify({
            email: userInfo.email,
            password: userInfo.password,
            returnSecureToken: true,
          }),
          headers: { "Content-Type": "application/json" },
        }
      ).then((res) => {
        if (res.ok) {
          dispatch({ type: "loadingOff" });
          return res.json().then(async (data) => {
            //check firestore for user Id
            const user = await getDoc(doc(firestore, "users", data.localId));
            if (user.exists()) {
              localStorage.setItem("refreshToken", data.refreshToken);
              dispatch({
                type: "login",
                payload: {
                  idToken: data.idToken,
                },
              });
            } else {
              throw new Error("User data not found.");
            }
          });
        } else {
          return res.json().then((data) => {
            let errorMessage = "Auth failed.";
            if (data && data.error && data.error.message) {
              errorMessage = data.error.message;
            }
            alert(errorMessage);
          });
        }
      });
    }

    if (type === "signUp") {
      await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebase_config.apiKey}`,
        {
          method: "POST",
          body: JSON.stringify({
            email: userInfo.email,
            password: userInfo.password,
            returnSecureToken: true,
          }),
          headers: { "Content-Type": "application/json" },
        }
      ).then((res) => {
        if (res.ok) {
          dispatch({ type: "loadingOff" });

          return res.json().then(async (data) => {
            // check firestore for user Id
            // create new
            const user = await getDoc(doc(firestore, "users", data.localId));
            if (user.exists()) {
              throw new Error("User email already in use.");
            } else {
              await setDoc(doc(firestore, "users", data.localId), {
                name: userInfo.name,
                surname: userInfo.surname,
                chatId: [],
              });
              await setDoc(doc(firestore, "friends", data.localId), {
                followers: [],
                following: [],
              });

              localStorage.setItem("refreshToken", data.refreshToken);
              dispatch({
                type: "login",
                payload: {
                  idToken: data.idToken,
                },
              });
            }
          });
        } else {
          return res.json().then((data) => {
            let errorMessage = "Auth failed.";
            if (data && data.error && data.error.message) {
              errorMessage = data.error.message;
            }
            alert(errorMessage);
          });
        }
      });
    }
  };

  return {
    sendAuthRequest,
  };
};

export default useAuthUser;
