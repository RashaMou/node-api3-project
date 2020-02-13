const express = require("express");

const server = express();
server.use(express.json());
server.use(logger);

const userDb = require("./users/userDb");
const postDb = require("./posts/postDb");

//custom middleware

function logger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} to ${req.url})}`);
  next();
}

function validateUserId(req, res, next) {
  let id = req.params.id;
  userDb.getById(id).then(retrieved => {
    if (retrieved) {
      let user = req.user;
    } else {
      res.status(400).json({ errorMessage: "Invalid user id" });
    }
  });
  next();
}

function validateUser(req, res, next) {
  if (!req.body) {
    res.status(400).json({ errorMessage: "Missing user data" }); // I am only getting the 'missing required name field' error even if I send back nothing
  } else if (!req.body.name) {
    res.status(400).json({ errorMessage: "Missing required name field" });
  }
  next();
}

function validatePost(req, res, next) {
  if (!req.body) {
    res.status(400).json({ errorMessage: "Missing post data" });
  } else if (!req.body.text) {
    res.status(400).json({ errorMessage: "Missing required text field" });
  }
  next();
}

server.get("/", (req, res) => {
  res.send(`<h2>Let's write some middleware!</h2>`);
});

server.get("/user", (req, res) => {
  userDb
    .get()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(error => {
      res.status(500).json({ errorMessage: "Users could not be retrieved" });
    });
});

server.get("/posts", (req, res) => {
  postDb
    .get()
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(error => {
      res.status(500).json({ errorMessage: "Posts could not be retrieved" });
    });
});

server.get("/user/:id", validateUserId, (req, res) => {
  const id = req.params.id;
  userDb
    .getById(id)
    .then(user => {
      if (user) {
        res.status(200).json(user);
      }
    })
    .catch(error => {
      res.status(500).json({ errorMessage: "User could not be retrieved" });
    });
});

server.get("/user/:id/posts", validateUserId, (req, res) => {
  let id = req.params.id;
  userDb
    .getUserPosts(id)
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(error =>
      res.status(500).json({ errorMessage: "could not get posts" })
    );
});

server.post("/user", validateUser, (req, res) => {
  let user = req.body;
  userDb
    .insert(user)
    .then(data => {
      res.status(201).json({ ...data, ...user });
    })
    .catch(error =>
      res.status(500).json({ message: "Error creating new user" })
    );
});

server.post("/user/:id/posts", validateUserId, (req, res) => {
  const id = req.params.id;
  let newPost = req.body;

  userDb
    .getById(id)
    .then(user => {
      user
        ? postDb
            .insert(newPost)
            .then(post => {
              res.status(201).json({ post, newPost });
            })
            .catch(error => {
              res.status(500).json({ message: "Could not create post" });
            })
        : res
            .status(404)
            .json({ message: "The user with the specified ID does not exist" });
    })
    .catch(error => {
      res.status(500).json({ message: "There was an error saving the post" });
    });
});

server.put("/user/:id/", (req, res) => {
  const newName = req.body;
  const id = req.params.id;
  userDb
    .getById(id)
    .then(user => {
      user
        ? userDb
            .update(id, newName)
            .then(user => {
              res
                .status(201)
                .json({ message: "Username updated", user, newName });
            })
            .catch(error => res.status(500).json({ message: "oops" }))
        : res
            .status(404)
            .json({ message: "Could not find user with specified ID" });
    })
    .catch(error => {
      res.status(500).json({ message: "Error updating username" });
    });
});

module.exports = server;
