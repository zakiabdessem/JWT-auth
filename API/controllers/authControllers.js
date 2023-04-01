require("dotenv").config();

const user = require("../models/user");
const validation = require("../utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createJwtToken = (payload, exp) => {
  return jwt.sign(payload, process.env.SECRET, {
    expiresIn: exp,
  });
};

module.exports.post_signUp = async (req, res) => {
  const { email, password, name } = req.body;

  /* validate email, password and name */
  //name
  const { error: nameError } = validation.nameValidation({
    name,
  });
  if (nameError) return res.status(400).json({ error: nameError.message });

  //email
  const { error: emailError } = validation.emailValidation({ email });
  if (emailError) return res.status(400).json({ error: emailError.message });

  //password
  const { error: passwordError } = validation.passwordValidation({ password });
  if (passwordError)
    return res.status(400).json({ error: passwordError.message });

  /* Check if user already exists */
  
  const duplicate = await user.findOne({ email: email });
  if (duplicate)
    return res.status(403).json({ error: "Email already registred" });

  try {
    /* hash password */
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    /* Save user to DB */
    const User = await user.create({
      email: email,
      password: hashedPassword,
      name,
    });

    const refreshToken = {
      payload: {
        id: User._id,
        email: User.email,
      },
      exp: "3d",
    };

    const accessToken = {
      payload: {
        id: User._id,
        email: User.email,
      },
      exp: "2h",
    };

    const _RefreshToken = createJwtToken(
      refreshToken.payload,
      refreshToken.exp
    );

    const _AccessToken = createJwtToken(accessToken.payload, accessToken.exp);

    //res.json(User) for testing purposes
    res
      .status(200)
      .cookie("jwt", _RefreshToken, {
        maxAge: 3 * 24 * 60 * 60 * 1000,
        httpOnly: false,
      })
      .cookie(`_cl${User._id}`, _AccessToken, {
        maxAge: 2 * 60 * 60 * 1000,
        httpOnly: false,
      })
      .json({
        auth: true,
        error: "none",
        userInformation: {
          name: User.name,
          id: User._id,
          email: User.email,
          profile_pic: User.profile_pic,
        },
      });
  } catch (e) {
    console.log(e);
    res.status(404).json({ error: "an error has occurred check API" });
  }
};

module.exports.post_login = async (req, res) => {
  const { email, password } = req.body;

  /* validate email */
  const { error: emailError } = validation.emailValidation({ email: email });
  if (emailError) return res.status(400).json({ error: emailError.message });
  const User = await user.findOne({ email }).select("+password");

  // return if there was no user with this username found in the database
  if (!User)
    return res.status(400).json({ error: "Email or password is wrong" });

  const isMatch = await bcrypt.compare(password, User.password);

  // return 400 if password does not match
  if (!isMatch)
    return res.status(400).json({ error: "Email or password is wrong" });

  try {
    const refreshToken = {
      payload: {
        id: User._id,
        email: User.email,
      },
      exp: "3d",
    };

    const accessToken = {
      payload: {
        id: User._id,
        email: User.email,
      },
      accessToken: true,
      exp: "2h",
    };

    const _RefreshToken = createJwtToken(
      refreshToken.payload,
      refreshToken.exp
    );

    const _AccessToken = createJwtToken(accessToken.payload, accessToken.exp);

    res
      .status(200)
      .cookie("jwt", _RefreshToken, {
        maxAge: 3 * 24 * 60 * 60 * 1000,
        httpOnly: false,
      })
      .cookie(`_cl${User._id}`, _AccessToken, {
        maxAge: 2 * 60 * 60 * 1000,
        httpOnly: false,
      })
      .json({
        auth: true,
        error: "none",
        userInformation: {
          name: User.name,
          id: User._id,
          email: User.email,
          profile_pic: User.profile_pic,
        },
      });
  } catch (e) {
    res.status(404).json({ auth: false, error: "Failed to login" });
    console.log(e);
  }
};

module.exports.verifyToken = async (req, res, next) => {
  const token = req.cookies["jwt"];
  if (!token) return (req.decodedToken = null);
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.decodedToken = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ auth: false });
  }
};
module.exports.verifyAccessToken = async (req, res, next) => {
  const token = req.cookies[`_cl${req.decodedToken?.id}`];

  if (!token) return (req.decodedToken = null);
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.decodedToken = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ auth: false });
  }
};
