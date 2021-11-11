import { Fragment, useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

import useRefreshState from "./components/hooks/useRefreshState";

import styles from "./App.module.css";
import Header from "./components/layout/Header";
import Feed from "./components/layout/Feed";
import Welcome from "./components/pages/Welcome";
import Login from "./components/pages/Login";
import Home from "./components/pages/Home";
import Messages from "./components/pages/Messages";
import Profile from "./components/pages/Profile";
import Spinner from "./components/UI/Spinner";

function App() {
  const { exchangeToken } = useRefreshState();
  const isLogged = !!useSelector((state) => state.idToken);
  const isLoading = useSelector((state) => state.isLoading);

  useEffect(() => {
    if (!isLogged && !!localStorage.getItem("refreshToken")) {
      exchangeToken();
    }
  }, [isLogged, exchangeToken]);

  return (
    <Fragment>
      <Header />
      <Feed>
        <Switch>
          <Route path="/" exact>
            {isLogged && <Redirect to="/home" />}
            {!isLogged && <Redirect to="/welcome" />}
          </Route>
          <Route path="/welcome">
            {isLogged && <Redirect to="/home" />}
            {!isLogged && !isLoading && <Welcome />}
            {isLoading && (
              <div className={styles.spinner}>
                <Spinner />
              </div>
            )}
          </Route>
          <Route path="/home">
            {isLogged ? <Home /> : <Redirect to="/welcome" />}
          </Route>
          <Route path="/messages">
            {isLogged ? <Messages /> : <Redirect to="/welcome" />}
          </Route>
          <Route path="/profile/:profileId" exact>
            {isLogged ? <Profile /> : <Redirect to="/welcome" />}
          </Route>
          <Route path="/login">
            {isLogged ? <Redirect to="/home" /> : <Login />}
          </Route>
        </Switch>
      </Feed>
    </Fragment>
  );
}

export default App;
