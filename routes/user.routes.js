require("dotenv").config({ path: "./config/.env" });
const router = require("express").Router();
const authController = require("../controllers/auth.controller.js");
const userController = require("../controllers/user.controller.js");
const uploadController = require("../controllers/upload.controller.js");
const { uploadErrors } = require("../utils/errors.utils");
const { upload } = require("../utils/upload.utils.js")

// auth
router.post("/register", authController.signUp);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// user
router.get("/", userController.getAllUsers);
router.get("/:id", userController.userInfo);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.patch("/follow/:id", userController.follow);
router.patch("/unfollow/:id", userController.unfollow);

// upload
router.post(
  "/upload",
  upload.single("file"),
  uploadController.uploadProfilePic
);
router.delete("/delete/:filename", uploadController.deleteProfilePic)

module.exports = router;