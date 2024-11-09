import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Typography } from "@mui/material";
import axios from "axios";

import "./styles.css";

function UserPhotos({ userId }) {
  const [photos, setPhotos] = useState([]); // stores an array of photo objects for the specified user

  // `useEffect` runs when `userId` changes, fetching the user's photos from the model
  useEffect(() => {
    axios.get(`/photosOfUser/${userId}`)
      .then((response) => {
        setPhotos(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user photos:", error);
      });
  }, [userId]); // Dependency array includes `userId` to re-fetch photos if it changes

  return (
    <div className="photo-section-container">
      {/* Header for the photos section */}
      <Typography variant="h6">Photos</Typography>

      {/* Iterate over each photo in the `photos` array and display it */}
      {photos.map(photo => (
        <div key={photo._id} className="photo-container">
          {/* Display the photo with its filename in the `images` directory */}
          <img src={`images/${photo.file_name}`} width="100%" />

          {/* Display the date and time the photo was taken */}
          <Typography variant="body2" className="photo-date">
            {`Date: ${new Date(photo.date_time).toLocaleString()}`}
          </Typography>

          {/* Display comments associated with each photo, if any */}
          <div className="comment-section">
            {photo.comments && photo.comments.map(comment => (
              <div key={comment._id}>
                {/* Display the commenter's name as a clickable link to their user detail page */}
                <Typography variant="body2" className="comment-text">
                  <Link to={`/users/${comment.user._id}`} className="commenter-link">
                    {comment.user.first_name} {comment.user.last_name}
                  </Link>: {comment.comment}
                </Typography>

                {/* Display the date and time the comment was created */}
                <Typography variant="caption" className="comment-date">
                  {new Date(comment.date_time).toLocaleString()}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserPhotos;