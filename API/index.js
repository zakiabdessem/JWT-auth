require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();

mongoose 
 .connect(process.env.DB_CONNECT, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        })   
 .then(() => console.log("Database connected!"))
 .catch(err => console.log(err));

// allow cross-origin requests

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:5173",
      "https://endearing-manatee-7b9388.netlify.app",
    ],
    methods: ["GET", "POST"],
  })
);
app.options("*", cors());
//
app.use(cookieParser());
//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const authRoute = require("./routes/auth");
app.use("/auth", authRoute);

const profileRoute = require("./routes/profile");
app.use("/profile", profileRoute);

const postRoute = require("./routes/posts");
app.use("/post", postRoute);

const changeEmail = require("./routes/credentials_change/email_change");
app.use("/change/email", changeEmail);

app.listen("3000", () => {
  console.log("listening to port 3000");
});
