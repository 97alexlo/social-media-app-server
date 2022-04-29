const PostModel = require("../models/post.model.js");
const UserModel = require("../models/user.model.js");
const aws = require("aws-sdk");

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: process.env.AWS_BUCKET_REGION,
});

const bucketName = process.env.AWS_BUCKET_NAME;
const s3 = new aws.S3();

const LIMIT = 5;

// get all posts from database
module.exports.allPosts = async (req, res) => {
  if (req.query.page) {
    try {
      const posts = await PostModel.paginate(
        {},
        { page: req.query.page, limit: LIMIT, sort: { createdAt: -1 } }
      );
      res.send(posts);
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports.deletePost = async (req, res) => {
  try {
    await PostModel.findById(req.params.id);
    PostModel.findByIdAndRemove(req.params.id, (err, docs) => {
      if (!err) {
        console.log(docs);
      } else {
        console.log(err);
      }
    });
  } catch (err) {
    return res.status(400).send("Invalid post ID");
  }

  if (req.body.filename && req.body.filename !== "") {
    s3.deleteObject(
      { Bucket: bucketName, Key: req.body.filename },
      (err, data) => {
        if (err) {
          console.log(err, err.stack);
        } else {
          return res.status(200).send("Successfully deleted post and picture");
        }
      }
    );
  }
};

module.exports.getPostsFromUser = async (req, res) => {
  if (req.query.page) {
    try {
      const posts = await PostModel.paginate(
        { posterId: req.params.userId },
        { page: req.query.page, limit: LIMIT, sort: { createdAt: -1 } }
      );
      res.send(posts);
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports.createPost = async (req, res) => {
  if (req.errors) {
    return res.json(req.errors);
  }
  // if (req.file !== null) {
  //   // rename file to req.body.name (User's name)
  //   fs.renameSync(
  //     req.file.path,
  //     req.file.path.replace("newFile", req.body.posterId)
  //   );
  //   fileName = req.body.posterId + ".jpg";
  // }

  const newPost = new PostModel({
    posterId: req.body.posterId,
    message: req.body.message,
    picture: req.file ? req.file.location : "",
    video: req.body.video,
    likers: [],
    comments: [],
  });
  try {
    const post = await newPost.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.updatePost = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (post) {
      const updatedPost = {
        message: req.body.message,
      };
      PostModel.findByIdAndUpdate(
        req.params.id,
        { $set: updatedPost },
        { new: true },
        (err, docs) => {
          if (!err) {
            res.send(docs);
          } else {
            console.log(err);
          }
        }
      );
    } else {
      return res.status(400).send("Invalid post ID");
    }
  } catch (err) {
    return res.status(400).send("Invalid post ID");
  }
};

module.exports.likePost = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    const user = await UserModel.findById(req.body.userId);
    if (user && post) {
      // add current user to likers of the post
      const updatedPost = await PostModel.findByIdAndUpdate(
        req.params.id,
        {
          $addToSet: { likers: req.body.userId },
        },
        { new: true }
      );

      // add post id to user's likes
      const updatedUser = await UserModel.findByIdAndUpdate(
        req.body.userId,
        {
          $addToSet: { likes: req.params.id },
        },
        { new: true }
      );
      return res.status(200).send(updatedPost);
    } else {
      res.status(400).send("Invalid user or post ID");
    }
  } catch (err) {
    // invalid post id or user id
    res.status(400).send(err);
  }
};

module.exports.unlikePost = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    const user = await UserModel.findById(req.body.userId);
    if (user && post) {
      // remove current user to likers of the post
      const updatedPost = await PostModel.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { likers: req.body.userId },
        },
        { new: true }
      );

      // remove post id from user's likes
      const updatedUser = await UserModel.findByIdAndUpdate(
        req.body.userId,
        {
          $pull: { likes: req.params.id },
        },
        { new: true }
      );
      return res.status(200).send(updatedPost);
    } else {
      res.status(400).send("Invalid user or post ID");
    }
  } catch (err) {
    // invalid post id or user id
    res.status(400).send(err);
  }
};

module.exports.commentPost = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (post) {
      // add a comment to array of comments of post
      const updatedPost = await PostModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            comments: {
              commenterId: req.body.commenterId,
              commenterUsername: req.body.commenterUsername,
              text: req.body.text,
              timestamp: new Date().getTime(),
            },
          },
        },
        { new: true }
      );
      return res.status(200).send(updatedPost);
    } else {
      res.status(400).send("Invalid post ID");
    }
  } catch (err) {
    // invalid post id or user id
    res.status(400).send({ err });
  }
};

module.exports.editCommentPost = async (req, res) => {
  try {
    PostModel.findById(req.params.id, (err, docs) => {
      if (err) {
        return res.status(404).send("Post not found");
      }

      const theComment = docs.comments.find((comment) =>
        comment._id.equals(req.body.commentId)
      );
      if (!theComment) return res.status(404).send("Comment not found");
      theComment.text = req.body.text;

      return docs.save((err) => {
        if (!err) return res.status(200).send(docs);
        return res.status(500).send(err);
      });
    });
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports.deleteCommentPost = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (post) {
      const updatedPost = await PostModel.findByIdAndUpdate(
        req.params.id,
        {
          $pull: {
            comments: {
              _id: req.body.commentId,
            },
          },
        },
        { new: true }
      );
      res.status(200).send(updatedPost);
    } else {
      res.status(400).send("Invalid post ID");
    }
  } catch (err) {
    return res.status(400).send(err);
  }
};
