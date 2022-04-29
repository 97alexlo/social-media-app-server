const UserModel = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const { signUpErrors, loginErrors } = require("../utils/errors.utils.js");

const tokenExpiry = 24 * 60 * 60 * 1000; // one day

const createToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: tokenExpiry,
  });
};

module.exports.signUp = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await UserModel.create({ username, email, password });
    res.status(201).json({ user: user._id });
    // 201 = created
  } catch (err) {
    const errors = signUpErrors(err);
    res.status(200).send({ errors });
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.login(email, password);
    const token = createToken(user._id);
    // save token in cookies
    res.cookie("jwt", token, {
      httpOnly: true, // cannot be accessed with javscript/client-side script
      maxAge: tokenExpiry,
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = loginErrors(err);
    res.status(200).send({ errors });
  }
};

module.exports.logout = (req, res) => {
  // empty cookies
  res.clearCookie("jwt")
  req.session.destroy();
  res.send("logged out");
  //res.redirect("/");
};
