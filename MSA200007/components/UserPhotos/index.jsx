import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Typography } from "@mui/material";
import axios from "axios";

import "./styles.css";

function UserPhotos({ userId, loggedUserId }) {
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
      //console.log(photos);
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
  const deleteComment = async (comment_id, photo_id) => {
    console.log("delete comment called " + loggedUserId);
    const body = {
      photo_id : photo_id,
      comment_id : comment_id
    };
    console.log(body);
    axios.delete('/comment/delete/', {data : body})
      .then((response) => {
        console.log(response);
      }).catch(error => {
        console.log(error);
      }
    );
  }
  const deletePhoto =  async (photo_id) => {
    console.log("Delete photo called");
    axios.delete(`/photo/delete/${photo_id}`).then((response) => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    });
  }

  const handleLikeClick = async(photo_id, liked) => {
    console.log("handle Like click callled");
    const body = {
      photoId : photo_id,
      userId: loggedUserId
    };
    if(!liked ) {
      await axios.post("/addLike/", body).then((response) => {
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
    } else {
      await axios.post("/removeLike", body).then((response) => {
        console.log(response);
      }).catch(error => {
        console.log(error);
      });
    }
  }
  return (
    <div className="photo-section-container">
      {/* Header for the photos section */}
      <Typography variant="h6">Photos</Typography>

      {/* Iterate over each photo in the `photos` array and display it */}
      {photos.map(photo => (
        <div key={photo._id} className="photo-container">
          {/* Display the photo with its filename in the `images` directory */}
          <img src={`images/${photo.file_name}`} width="100%" />
          {loggedUserId === photo.user_id && 
            <Button variant="contained" color="error" onClick={() => deletePhoto(photo._id)}>Delete Photo</Button>
          }
          {photo.likes.length}<button onClick={() => handleLikeClick(photo._id, photo.likes.includes(loggedUserId))}> {photo.likes.includes(loggedUserId) ? '❤️ Liked' : '🤍 Like' } </button>
        
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
                {
                  comment.user._id === loggedUserId 
                  && <button onClick={() => deleteComment(comment._id, photo._id)}>Delete</button>
                }
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