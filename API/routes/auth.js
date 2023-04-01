const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const user = require("../models/user");

const authController = require("../controllers/authControllers");
router.post("/sign-up", authController.post_signUp);
router.post("/login", authController.post_login);
// verify Refresh Token
router.get("/verify", authController.verifyToken, async (req, res) => {
  const decoded = req.decodedToken;
  if (decoded == null) return res.status(404).json({ auth: false }); // if there is no jwt token
  const User = await user.findOne({ email: decoded.email }).exec();
  if (User === null) return res.status(404).json({ auth: false }); // if there is no matched user
  res.status(200).json({ auth: true });
});
// verify Access Token
router.get("/verify/access", authController.verifyToken, async (req, res) => {
  const decoded = req.decodedToken;
  if (decoded == null) return res.status(404).json({ auth: false }); // if there is no jwt token
  if (decoded.accessToken == true) res.status(200).json({ auth: true });
  else res.status(404).json({ auth: false });
});
module.exports = router;
