import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Typography } from "@mui/material";
import axios from "axios";

import "./styles.css";

function UserPhotos({ userId }) {
  const [photos, setPhotos] = useState([]); // stores an array of photo objects for the specified user
  //const [comment, setComment] = useState("");
  // `useEffect` runs when `userId` changes, fetching the user's photos from the model
  useEffect(() => {
    axios.get(`/photosOfUser/${userId}`)
      .then((response) => {
        setPhotos(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user photos:", error);
      });
  }, [userId, photos]); // Dependency array includes `userId` to re-fetch photos if it changes

  const addNewComment = async (e, photoId) => {
    e.preventDefault();
    const comment = document.getElementById("newComment_"+photoId).value;
    console.log(comment + " " + photoId);
    const body = {
      comment: comment    
    };
    axios.post(`/commentsOfPhoto/${photoId}`, body)
      .then((response) => {
        console.log("succesfully added comment");
        console.log(response.data);
        const newComment = response.data;
        setPhotos((prevPhotos) => prevPhotos.map((photo) => (photo._id === photoId ? { ...photo, comments: [...photo.comments, newComment] } : photo))
        );
        document.getElementById("newComment_"+photoId).value="";
      })
      .catch((error) => {
        console.error("error adding comments:", error);
      });
    //setComment("");
  };
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
              <div className="newCommentsForm">
                <form onSubmit={(e) => addNewComment(e,photo._id)}>
                  <input type="text" name="newComment" placeholder="Comment ..." id={`newComment_`+photo._id} required/>
                  <input type="submit" value="submit" />
                </form>
              </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserPhotos;