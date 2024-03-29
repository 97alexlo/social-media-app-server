require("dotenv").config({ path: "./config/.env" });
const router = require("express").Router();
const postController = require("../controllers/post.controller");
const { upload } = require("../utils/upload.utils.js")

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
