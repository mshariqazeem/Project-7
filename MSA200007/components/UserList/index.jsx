import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import axios from "axios";

import "./styles.css";

function UserList({loggedUser}) {
  const [users, setUsers] = useState([]); // stores an array of user objects fetched from the model

  // `useEffect` hook runs only once when the component mounts (empty dependency array),
  useEffect(() => {
  axios.get("/user/list")
    .then((response) => {
      setUsers(response.data);
    })
    .catch((error) => {
      console.error("Error fetching user list:", error);
    });
}, []);

  return (
    <div className="user-list-container">
      {/* Heading for the List of User */}
      <Typography variant="body1" className="user-list-title">User List</Typography>
      
      {/* Main navigation list displaying all users */}
      <List component="nav">
        {users.map(user => (
          // Wrap each user item and its divider in a fragment with a unique `key` for React
          <React.Fragment key={user._id}>
            <ListItem className="user-list-item">
              {/* Display the user's full name as a clickable link to their details page */}
              <ListItemText
                primary={<Link to={`/users/${user._id}`}>{`${user.first_name} ${user.last_name}`}</Link>}
              />
            </ListItem>
            <Divider className="user-list-divider"/>
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;