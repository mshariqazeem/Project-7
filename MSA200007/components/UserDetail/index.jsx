import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Typography } from "@mui/material";
import axios from "axios";

import "./styles.css";

function UserDetail({ userId }) {
  const [user, setUser] = useState(null); // stores the details of the user fetched by `userId`

  // `useEffect` fetches the user data whenever `userId` changes
  useEffect(() => {
    axios.get(`/user/${userId}`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });
  }, [userId]); // Dependency array includes `userId` to re-fetch data if it changes

  // If `user` data is not yet loaded, display a loading message
  if (!user) return <Typography>Loading...</Typography>;

  return (
    <div className="user-detail-container">
      {/* Display user's full name in a header */}
      <Typography variant="h6" className="user-detail-name">{`${user.first_name} ${user.last_name}`}</Typography>
      
      {/* Display additional user details */}
      <Typography variant="body1" className="user-detail-info">{`Location: ${user.location}`}</Typography>
      <Typography variant="body1" className="user-detail-info">{`Description: ${user.description}`}</Typography>
      <Typography variant="body1" className="user-detail-info">{`Occupation: ${user.occupation}`}</Typography>
      
      {/* Link to navigate to the user's photos */}
      <Link to={`/photos/${userId}`} className="user-detail-link">View Photos</Link>
    </div>
  );
}

export default UserDetail;