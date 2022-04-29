require("dotenv").config({ path: "./config/.env" });
const router = require("express").Router();
const postController = require("../controllers/post.controller");
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
    file.mimetype !== "image/jpeg" &&
    file.mimetype !== "image/webp"
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
      cb(null, file.originalname);
    },
  }),
  fileFilter: fileFilter,
});

router.get("/", postController.allPosts); // all posts from database
router.get("/user/:userId/limit?", postController.getPostsFromUser);
router.post("/", upload.single("file"), postController.createPost);
router.put("/:id", postController.updatePost);
router.delete("/:id", postController.deletePost);
router.patch("/like-post/:id", postController.likePost);
router.patch("/unlike-post/:id", postController.unlikePost);

// comments
router.patch("/comment-post/:id", postController.commentPost);
router.patch("/edit-comment-post/:id", postController.editCommentPost);
router.patch("/delete-comment-post/:id", postController.deleteCommentPost);

module.exports = router;
