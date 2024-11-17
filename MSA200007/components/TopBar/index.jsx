import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";

function TopBar({loggedUser, onLogout}) {
  const loc = useLocation();    // stores the current URL path
  const [pageTtile, setPageTtile] = useState("Welcome");  // stores the text shown on the right side of the top bar
  const [selectedUser, setSelectedUser] = useState(null); // stores the information for the currently selected user, if available
  const [version, setVersion] = useState("");
  const [uploadInput, setUploadInput] = useState(null);
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
          setSelectedUser(response.data); // Set user data from server response
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setSelectedUser(null); // Clear user state if fetching fails
        });
    } else {
      // Clear `user` if no valid `userId` is found in the URL
      setSelectedUser(null);
    }
  }, [loc.pathname]); // Dependency array to re-run this effect when `loc.pathname` changes

  // Effect to update the `pageTtile` based on the current URL path and `user` information
  useEffect(() => {
    if (loc.pathname === "/") {
      // Default pageTtile for the home page
      setPageTtile("Welcome");
    } else if (loc.pathname === "/users") {
      // Default pageTtile for user list page
      setPageTtile("List of Users");
    } else if (loc.pathname.includes("/users/") && selectedUser) {
      // Set pageTtile to the user's full name if on a user's detail page and `user` data is available
      setPageTtile(`${selectedUser.first_name} ${selectedUser.last_name}`);
    } else if (loc.pathname.includes("/photos/") && selectedUser) {
      // Set pageTtile to reflect the photos of the user if on a user's photos page and `user` data is available
      setPageTtile(`Photos of ${selectedUser.first_name} ${selectedUser.last_name}`);
    }
  }, [loc, selectedUser]); // Dependencies on `loc` and `user` to re-run this effect when they change

  const handleLogout = async () => {
    try {
      await axios.post("/admin/logout");
      onLogout(); // Clears the user state in PhotoShare
      setPageTtile("Welcome");
      navigate("/login-register");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleUploadButtonClicked = async (e) => {
    e.preventDefault();
    if (uploadInput.files.length > 0) {
      // Create a DOM form and add the file to it under the name uploadedphoto
      const domForm = new FormData();
      domForm.append('uploadedphoto', uploadInput.files[0]);
      //console.log(domForm);
      axios.post('/photos/new', domForm)
        .then((res) => {
          console.log(res);
          setUploadInput(null);
        })
        .catch(err => console.log(`POST ERR: ${err}`));
    }
  }

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        {/* Left side of the toolbar displays my name */}
        <Typography variant="h5" color="inherit" style={{ flex: 1 }}>
          Shariq Azeem
        </Typography>
        {/* Right side of the toolbar displays the dynamic pageTtile based on the current page */}
        <Typography variant="h5" color="inherit" style={{ flex: 1 }}>
          {pageTtile}
        </Typography>
        <Box display="flex" flexDirection="column" alignItems="center" ml={2}>
          {loggedUser ? (
            <Typography variant="h5" color="inherit">
              Hi {loggedUser.first_name}
              <Button onClick={handleLogout}>Logout</Button>
              <input type="file" accept="image/*" name="uploadedphoto" ref={(domFileRef) => {setUploadInput(domFileRef) }} />
              {
                uploadInput != null && <Button onClick={(e) => {
                  handleUploadButtonClicked(e);
                }}>Upload the photo</Button>
              }
            </Typography>
          ) : (
            <Typography variant="h5" color="inherit">
              Please Login
            </Typography>
          )}
          <Typography variant="caption" color="inherit">{version && `Version: ${version}`}</Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;