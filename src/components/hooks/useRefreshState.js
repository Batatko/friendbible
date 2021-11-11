import { useDispatch } from "react-redux";
import firebase_config from "../../firebase_config"

const useRefreshState = () => {
  const dispatch = useDispatch();

  const exchangeToken = async () => {
    dispatch({ type: "loadingOn" });
    await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${firebase_config.apiKey}`,
      {
        method: "POST",
        body: new URLSearchParams(
          `grant_type=refresh_token&refresh_token=${localStorage.getItem(
            "refreshToken"
          )}`
        ),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    ).then((res) => {
      if (res.ok) {
        return res.json().then((data) => {
          localStorage.setItem("refreshToken", data.refresh_token);
          dispatch({
            type: "login",
            payload: {
              idToken: data.id_token,
            },
          });
          dispatch({ type: "loadingOff" });
        });
      } else {
        return res.json().then((data) => {
          let errorMessage = "Refresh token failed!";
          if (data && data.error && data.error.message) {
            errorMessage = data.error.message;
          }
          alert(errorMessage);
        });
      }
    });
  };

  const getUserId = async () => {
    const res = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${firebase_config.apiKey}`,
      {
        method: "POST",
        body: new URLSearchParams(
          `grant_type=refresh_token&refresh_token=${localStorage.getItem(
            "refreshToken"
          )}`
        ),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data = await res.json();

    dispatch({
      type: "setUserId",
      payload: {
        userId: data.user_id,
      },
    });

    return data.user_id;
  };

  return {
    exchangeToken,
    getUserId,
  };
};

export default useRefreshState;
