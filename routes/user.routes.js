require("dotenv").config({ path: "./config/.env" });
const router = require("express").Router();
const authController = require("../controllers/auth.controller.js");
const userController = require("../controllers/user.controller.js");
const uploadController = require("../controllers/upload.controller.js");
const { uploadErrors } = require("../utils/errors.utils");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: process.env.AWS_BUCKET_REGION,
});

const bucketName = process.env.AWS_BUCKET_NAME;
const s3 = new aws.S3();

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype !== "image/jpg" &&
    file.mimetype !== "image/png" &&
    file.mimetype !== "image/jpeg"
  ) {
    return callback(
      null,
      false,
      (req.errors = uploadErrors(new Error("Invalid file format")))
    );
  }
  callback(null, true);
};

var upload = multer({
  storage: multerS3({
    bucket: bucketName,
    s3: s3,
    acl: "public-read",
    key: function (req, file, cb) {
      cb(null, file.originalname)
    },
  }),
  fileFilter: fileFilter,
});

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