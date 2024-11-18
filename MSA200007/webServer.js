/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the project6 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
// const async = require("async");

const express = require("express");
const app = express();

app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");

const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
// const models = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

// Middleware to check if a user is logged in
function requireLogin(request, response, next) {
  if (!request.session.user) {
    return response.status(401).send("Unauthorized");
  }
  return next();
}

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", async function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info" || param == null) {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    try{

      const info = await SchemaInfo.find({});
      if (info.length === 0) {
            // No SchemaInfo found - return 500 error
            return response.status(500).send("Missing SchemaInfo");
      }
      console.log("SchemaInfo", info[0]);
      return response.json(info[0]); // Use `json()` to send JSON responses
    } catch(err){
      // Handle any errors that occurred during the query
      console.error("Error in /test/info:", err);
      return response.status(500).json(err); // Send the error as JSON
    }

  } else if (param === "counts") {
   // If the request parameter is "counts", we need to return the counts of all collections.
// To achieve this, we perform asynchronous calls to each collection using `Promise.all`.
// We store the collections in an array and use `Promise.all` to execute each `.countDocuments()` query concurrently.
   
    
const collections = [
  { name: "user", collection: User },
  { name: "photo", collection: Photo },
  { name: "schemaInfo", collection: SchemaInfo },
];

try {
  await Promise.all(
    collections.map(async (col) => {
      col.count = await col.collection.countDocuments({});
      return col;
    })
  );

  const obj = {};
  for (let i = 0; i < collections.length; i++) {
    obj[collections[i].name] = collections[i].count;
  }
  return response.end(JSON.stringify(obj));
} catch (err) {
  return response.status(500).send(JSON.stringify(err));
}
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    return response.status(400).send("Bad param " + param);
  }
});

// Login route
app.post("/admin/login", async (request, response) => {
  const { login_name, password } = request.body;
  
  if (!login_name || !password) {
    console.log("Missing login_name or password in request body");
    return response.status(400).send("Missing login_name or password");
  }

  try {
    const user = await User.findOne({ login_name });
    if (!user || user.password !== password) {
      console.log("Invalid login name or password");
      return response.status(400).send("Invalid login name or password");
    }

    request.session.user = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    return response.status(200).json(request.session.user);
  } catch (error) {
    console.error("Error during login:", error);
    return response.status(500).send("Internal server error");
  }
});

// Register user route
app.post("/user", async (request, response) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = request.body;

  // Validate input fields
  if (!login_name || !password || !first_name || !last_name) {
    console.log("Missing one of the required fields");
    return response.status(400).send("Missing one or more required fields: login_name, password, first_name, last_name");
  }

  try {
    // Check if login_name already exists
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      console.log("Login name already exists");
      return response.status(400).send("Login name already exists");
    }

    // Create new user
    const newUser = new User({
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation,
    });

    await newUser.save();
    return response.status(200).json({ login_name: newUser.login_name, _id: newUser._id });
  } catch (error) {
    console.error("Error creating user:", error);
    return response.status(500).send("Internal server error");
  }
});

// Logout route
app.post("/admin/logout", async (request, response) => {
  if (!request.session.user) {
    return response.status(400).send("No user is currently logged in");
  }

  // Wrap session destruction in a promise to use async/await
  await new Promise((resolve, reject) => {
    request.session.destroy((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  return response.status(200).send("Logged out successfully");
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", requireLogin, async (request, response) => {
  try {
    const users = await User.find({}, "_id first_name last_name");
    response.status(200).json(users);
  } catch (error) {
    console.error("Error fetching user list:", error);
    response.status(500).send("Internal server error");
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", requireLogin, async function (request, response) {
  const id = request.params.id;
  try {
    const user = await User.findById(id, "_id first_name last_name location description occupation");
    if (!user) {
      console.log("User with _id:" + id + " not found.");
      return response.status(400).send("Not found");
    }
    return response.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    return response.status(400).send("Invalid user ID");
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", requireLogin, async function (request, response) {
  const id = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log("Invalid user ID format:", id);
    return response.status(400).send("Invalid user ID format");
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      console.log("User with _id:" + id + " not found.");
      return response.status(400).send("User not found");
    }

    const photos = await Photo.find({ user_id: id }, "_id user_id file_name date_time comments")
      .populate({
        path: "comments.user_id",
        model: "User",
        select: "_id first_name last_name",
      });

    const photosWithComments = photos.map((photo) => {
      const formattedComments = photo.comments.map((comment) => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: comment.user_id
          ? {
              _id: comment.user_id._id,
              first_name: comment.user_id.first_name,
              last_name: comment.user_id.last_name,
            }
          : null,
      }));

      return {
        _id: photo._id,
        user_id: photo.user_id,
        file_name: photo.file_name,
        date_time: photo.date_time,
        comments: formattedComments,
      };
    });

    return response.status(200).json(photosWithComments);
  } catch (error) {
    console.error("Error fetching photos for user:", error);
    return response.status(500).send("Internal server error");
  }
});


app.post("/commentsOfPhoto/:photo_id",  async (request, response) => {
  if(request.session.user != null) {
    const photo_id = request.params.photo_id;
    const comment = request.body.comment;
    console.log(comment);
    const newComment = {
      comment: comment,
      user_id: request.session.user._id,
      date_time: new Date()
    };
    console.log(newComment);
    const photo = await Photo.findById(photo_id).populate("comments");
    if(!photo) {
      response.json(404).send("Photo not found");
    }
    photo.comments.push(newComment);
    const savedPhoto = await photo.save();
    console.log(savedPhoto.comments.at(-1));
    const savedComment = savedPhoto.comments.at(-1);
    const formattedComment = {
      _id: savedComment._id,
      comment: savedComment.comment,
      date_time: savedComment.date_time,
      user: savedComment.user_id
        ? {
            _id: request.session.user._id,
            first_name: request.session.user.first_name,
            last_name: request.session.user.last_name,
          }
        : null
    };
    response.status(200).json(formattedComment);

  } else {
    response.status(401).send("UnAuthorized please login");
  }
}
);

app.post("/photos/new", async (request, response) => {
  try {
    if(request.session.user != null) {
      processFormBody(request, response, function (err) {
        if (err || !request.file) {
            response.status(400).send("No File");
            return;
        }
      
        // request.file has the following properties of interest:
        //   fieldname    - Should be 'uploadedphoto' since that is what we sent
        //   originalname - The name of the file the user uploaded
        //   mimetype     - The mimetype of the image (e.g., 'image/jpeg',
        //                  'image/png')
        //   buffer       - A node Buffer containing the contents of the file
        //   size         - The size of the file in bytes
      
        // XXX - Do some validation here.
      
        // We need to create the file in the directory "images" under an unique name.
        // We make the original file name unique by adding a unique prefix with a
        // timestamp.
        const timestamp = new Date().valueOf();
        const filename = 'U' +  String(timestamp) + request.file.originalname;
      
        fs.writeFile("./images/" + filename, request.file.buffer, async function (error) {
          // XXX - Once you have the file written into your images directory under the
          // name filename you can create the Photo object in the database
          if(error) {
            response.status(400).send("No File");
          }
          const photo = new Photo( {
            file_name: filename,
            date_time: timestamp,
            user_id: request.session.user._id,
            comments: []
          });
          await photo.save();
          response.status(200).send("photo uploaded successfully");
        });
      });
    } else {
      response.status(401).send("UnAuthorized please login");
    }
  } catch(error) {
    response.status(400).json(error);
  }
});
const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});