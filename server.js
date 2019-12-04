const express = require("express");

const server = express();
server.use(express.json());
server.use(logger);

const userDb = require("./users/userDb");
const postDb = require("./posts/postDb");

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

//custom middleware

function logger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} to ${req.url})}`);
  next();
}

// function validateUserId()

// function validateUser()

// function validatePost()

module.exports = server;
