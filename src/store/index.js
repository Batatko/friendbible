import { createStore } from "redux";

const initialState = {
  idToken: "",
  userId: "",
  isLoading: false,
  profilePicture: "",
};

const authStateReducer = (state = initialState, action) => {
  const data = action.payload;
  switch (action.type) {
    case "login": {
      return { ...state, idToken: data.idToken };
    }

    case "logout": {
      return { ...state, idToken: "", userId: "", profilePicture: "" };
    }

    case "setUserId": {
      return { ...state, userId: data.userId };
    }

    case "loadingOn": {
      return { ...state, isLoading: true };
    }

    case "loadingOff": {
      return { ...state, isLoading: false };
    }

    case "setProfilePicture": {
      return {
        ...state,
        profilePicture: data.link,
      };
    }

    default:
      return state;
  }
};

const store = createStore(authStateReducer);

export default store;
