require("dotenv").config({ path: ".env" });
require("./config/db.js");
const express = require("express");
const userRoutes = require("./routes/user.routes.js");
const postRoutes = require("./routes/post.routes.js");
const cookieParser = require("cookie-parser");
const { checkUser, requireAuth } = require("./middleware/auth.middleware.js");
const res = require("express/lib/response");
const cors = require("cors");
const path = require("path");

const app = express();

app.set("trust proxy", 1);

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  allowedHeaders: ["sessionId", "Content-Type", "Access-Control-Allow-Origin"],
  exposedHeaders: ["sessionId"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// jwt
app.get("*", checkUser); 
// Get jwt token (works only if logged in and returns user id which is stored in the token)
app.get("/jwtid", requireAuth, (req, res) => {
  res.status(200).send(res.locals.user._id);
});

// routes
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);

app.listen(process.env.PORT || 8080, () => {
  console.log(`listening on port ${process.env.PORT}`);
});
