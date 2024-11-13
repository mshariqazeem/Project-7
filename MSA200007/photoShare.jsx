import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { Grid, Paper } from "@mui/material";
import { HashRouter, Route, Routes, useParams, Navigate } from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";

function UserDetailRoute() {
  const { userId } = useParams();
  console.log("UserDetailRoute: userId is:", userId);
  return <UserDetail userId={userId} />;
}

function UserPhotosRoute() {
  const { userId } = useParams();
  return <UserPhotos userId={userId} />;
}

function PhotoShare() {
  const [loggedUser, setLoggedUser] = useState(null); // State to store the logged-in user

  const onLogout = () => {
    setLoggedUser(null); // Clear the user state on logout
  };

  return (
    <HashRouter>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar loggedUser={loggedUser} onLogout={onLogout} />
          </Grid>
          <div className="main-topbar-buffer" />
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              {loggedUser ? <UserList /> : <Navigate to="/login-register" />}
            </Paper>
          </Grid>
          <Grid item sm={9}>
            <Paper className="main-grid-item">
              <Routes>
                <Route path="/" element={loggedUser ? <Navigate to={`/users/${loggedUser._id}`} /> : <Navigate to="/login-register" />} />
                <Route path="/users" element={loggedUser ? <Navigate to={`/users/${loggedUser._id}`} /> : <Navigate to="/login-register" />} />
                <Route path="/users/:userId" element={loggedUser ? <UserDetailRoute /> : <Navigate to="/login-register" />} />
                <Route path="/photos" element={loggedUser ? <Navigate to={`/photos/${loggedUser._id}`} /> : <Navigate to="/login-register" />} />
                <Route path="/photos/:userId" element={loggedUser ? <UserPhotosRoute /> : <Navigate to="/login-register" />} />
                <Route path="/login-register" element={!loggedUser ? <LoginRegister onLogin={setLoggedUser} /> : <Navigate to="/" />}/>
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </HashRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(<PhotoShare />);