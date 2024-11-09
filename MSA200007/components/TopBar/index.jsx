import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function TopBar({onLogout}) {
  const loc = useLocation();    // stores the current URL path
  const [rightTitle, setRightTitle] = useState("Welcome");  // stores the text shown on the right side of the top bar
  const [user, setUser] = useState(null); // stores the information for the currently selected user, if available
  const [version, setVersion] = useState("");
  const navigate = useNavigate();

  // Effect to fetch version data
  useEffect(() => {
    // Fetch the version info from `/test/info`
    axios.get("/test/info")
      .then((response) => {
        setVersion(`v${response.data.__v}`);
      })
      .catch((error) => {
        console.error("Error fetching version info:", error);
      });
  }, []);

  // Effect to fetch user data whenever `loc.pathname` changes
  useEffect(() => {
    // Extracts `userId` from the URL if the path matches `/users/:userId` or `/photos/:userId`
    const match = loc.pathname.match(/\/(users|photos)\/(\w+)/);
    const userId = match ? match[2] : null;

    if (userId) {
      // Fetch user data from the server using `axios` and update `user` state
      axios.get(`/user/${userId}`)
        .then((response) => {
          setUser(response.data); // Set user data from server response
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setUser(null); // Clear user state if fetching fails
        });
    } else {
      // Clear `user` if no valid `userId` is found in the URL
      setUser(null);
    }
  }, [loc.pathname]); // Dependency array to re-run this effect when `loc.pathname` changes

  // Effect to update the `rightTitle` based on the current URL path and `user` information
  useEffect(() => {
    if (loc.pathname === "/") {
      // Default rightTitle for the home page
      setRightTitle("Welcome");
    } else if (loc.pathname === "/users") {
      // Default rightTitle for user list page
      setRightTitle("List of Users");
    } else if (loc.pathname.includes("/users/") && user) {
      // Set rightTitle to the user's full name if on a user's detail page and `user` data is available
      setRightTitle(`${user.first_name} ${user.last_name}`);
    } else if (loc.pathname.includes("/photos/") && user) {
      // Set rightTitle to reflect the photos of the user if on a user's photos page and `user` data is available
      setRightTitle(`Photos of ${user.first_name} ${user.last_name}`);
    }
  }, [loc, user]); // Dependencies on `loc` and `user` to re-run this effect when they change

  const handleLogout = async () => {
    try {
      await axios.post("/admin/logout");
      onLogout(); // Clears the user state in PhotoShare
      setRightTitle("Welcome");
      navigate("/login-register");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        {/* Left side of the toolbar displays my name */}
        <Typography variant="h5" color="inherit" style={{ flex: 1 }}>
          Shariq Azeem
        </Typography>
        {/* Right side of the toolbar displays the dynamic rightTitle based on the current page */}
        <Typography variant="h6" color="inherit">
          {rightTitle} {version && ` - ${version}`}
        </Typography>
        {user ? (
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        ) : (<></>)}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;