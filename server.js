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
      req.user = user;
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

// function validatePost()

server.get("/", (req, res) => {
  res.send(`<h2>Let's write some middleware!</h2>`);
});

server.get("/users", (req, res) => {
  userDb
    .get()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(error => {
      res.status(500).json({ errorMessage: "Users could not be retrieved" });
    });
});

server.get("/users/:id", validateUserId, (req, res) => {
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

server.post("/users", validateUser, (req, res) => {
  let user = req.body;
  userDb.insert(user).then(data => {
    res.status(201).json({ ...data, ...user });
  });
});

module.exports = server;
