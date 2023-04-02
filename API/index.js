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
    origin: ['*'],
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


app.listen("3000", () => {
  console.log("listening to port 3000");
});
