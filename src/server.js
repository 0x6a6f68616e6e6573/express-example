const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();
const upload = multer();

app.set("view engine", "pug");
app.set("views", "./views");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(upload.array());
app.use(
  session({
    secret: "a31560932658be83e16e7473bdd16319",
  })
);

const Users = [];

function checkSignIn(req, res, next) {
  if (req.session.user) {
    next(); //If session exists, proceed to page
  } else {
    var err = new Error("Not logged in!");
    console.log(req.session.user);
    next(err); //Error, trying to access unauthorized page!
  }
}

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/protected_page", checkSignIn, function (req, res) {
  res.render("protected_page", { id: req.session.user.id });
});

app.use("/protected_page", function (err, req, res, next) {
  console.log(err);
  //User should be authenticated! Redirect him to log in.
  res.redirect("/login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", (req, res) => {
  if (!req.body.id || !req.body.password)
    return res.status(400).send("Invalid details!");

  // Find every user with a matching id
  const existingUsers = Users.filter((user) => user.id === req.body.id);
  if (existingUsers.length > 0)
    return res.render("signup", { message: "User already exists!" });

  const user = {
    id: req.body.id,
    password: req.body.password,
  };

  Users.push(user);

  req.session.user = user;

  res.redirect("/protected_page");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", function (req, res) {
  console.log(Users);

  if (!req.body.id || !req.body.password)
    return res.render("login", {
      message: "Please enter both id and password",
    });

  // Find every user with matching id and password
  const existingUsers = Users.filter(
    (user) => user.id === req.body.id && user.password === req.body.password
  );

  if (existingUsers.length > 0) {
    req.session.user = existingUsers[0];
    return res.redirect("/protected_page");
  }

  res.render("login", { message: "Invalid credentials!" });
});

app.get("/logout", function (req, res) {
  req.session.destroy(function () {
    console.log("user logged out.");
  });
  res.redirect("/login");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
