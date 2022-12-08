const UserModel = require("../models/user.model.js");
const jwt = require("jsonwebtoken");

module.exports.checkUser = (req, res, next) => {
  // retrive jwt from cookies which was set on login
  const token = req.cookies.jwt;
  if (token && token !== "") {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      // invalid token
      if (err) {
        console.log(res.local.user);
        res.locals.user = null;
        // res.send({error: err})
        // res.cookie("jwt", "", { maxAge: 1 });
        next();
      } else {
        //console.log("verified")
        let user = await UserModel.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    // res.status(401).send("not authenticated")
    res.locals.user = null;
    next();
  }
};

module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log(err);
      } else {
        //console.log(decodedToken.id);
        next();
      }
    });
  } else {
    console.log("No Token")
  }
};
