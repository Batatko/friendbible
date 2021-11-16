import { useState } from "react";

import useAuthUser from "../hooks/useAuthUser";

import styles from "./Login.module.css";
import logo from "../../assets/logo/fb.svg";
import Feed from "../layout/Feed";

import { Card } from "@mui/material";
import { Button } from "@mui/material";
import { TextField } from "@mui/material";
import { Box } from "@mui/system";

const Login = () => {
  const { sendAuthRequest } = useAuthUser();
  const [isSignUp, setIsSignUp] = useState(false);
  const [enteredInput, setEnteredInput] = useState({
    email: "",
    password: "",
    name: "",
    surname: "",
  });

  const inputDataHandler = (input, id) => {
    setEnteredInput((prevState) => ({ ...prevState, [id]: input }));
  };

  const signInHandler = (e) => {
    e.preventDefault();
    sendAuthRequest("signIn", enteredInput);
  };

  const signUpHandler = (e) => {
    e.preventDefault();
    sendAuthRequest("signUp", enteredInput);
  };

  const createAccHandler = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <Feed className={styles.feed}>
      <Card className={styles.card}>
        <section className={styles.background}>
          <div className={styles["image-container"]}>
            <img src={logo} alt="logo" />
          </div>
        </section>
        <section className={styles["input-section"]}>
          {!isSignUp && (
            <Box
              id="auth"
              component="form"
              className={styles.form}
              onSubmit={signInHandler}
            >
              <div className={styles["input-container"]}>
                <TextField
                  id="email"
                  label="Enter email"
                  onChange={(e) => inputDataHandler(e.target.value, "email")}
                />
              </div>
              <div className={styles["input-container"]}>
                <TextField
                  id="password"
                  label="Enter password"
                  color="primary"
                  onChange={(e) => inputDataHandler(e.target.value, "password")}
                />
              </div>
            </Box>
          )}
          {isSignUp && (
            <Box
              id="auth"
              component="form"
              className={styles.form}
              onSubmit={signUpHandler}
            >
              <div className={styles["input-container"]}>
                <TextField
                  id="name"
                  label="Enter name"
                  onChange={(e) => inputDataHandler(e.target.value, "name")}
                />
              </div>
              <div className={styles["input-container"]}>
                <TextField
                  id="surname"
                  label="Enter surname"
                  onChange={(e) => inputDataHandler(e.target.value, "surname")}
                />
              </div>
              <div className={styles["input-container"]}>
                <TextField
                  id="email"
                  label="Enter email"
                  onChange={(e) => inputDataHandler(e.target.value, "email")}
                />
              </div>
              <div className={styles["input-container"]}>
                <TextField
                  id="password"
                  label="Enter password"
                  onChange={(e) => inputDataHandler(e.target.value, "password")}
                />
              </div>
            </Box>
          )}
          <div className={styles["button-cont"]}>
            <Button
              sx={{ fontSize: "15px", fontWeight: "550" }}
              className={styles.button}
              variant="contained"
              onClick={createAccHandler}
            >
              {isSignUp && <p>Login</p>}
              {!isSignUp && <p>SignUp</p>}
            </Button>
            {isSignUp ? (
              <Button
                sx={{ fontSize: "15px", fontWeight: "550" }}
                className={styles.button}
                variant="contained"
                type="submit"
                form="auth"
              >
                SignUp
              </Button>
            ) : (
              <Button
                sx={{ fontSize: "15px", fontWeight: "550" }}
                className={styles.button}
                variant="contained"
                type="submit"
                form="auth"
              >
                Login
              </Button>
            )}
          </div>
        </section>
      </Card>
    </Feed>
  );
};

export default Login;
