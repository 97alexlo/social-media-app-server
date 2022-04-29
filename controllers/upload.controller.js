require("dotenv").config({ path: "./config/.env" });
const UserModel = require("../models/user.model.js");
const aws = require("aws-sdk");

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: process.env.AWS_BUCKET_REGION,
});

const bucketName = process.env.AWS_BUCKET_NAME;
const s3 = new aws.S3();

module.exports.uploadProfilePic = async (req, res) => {
  if (req.errors) {
    return res.json(req.errors);
  }

  try {
    const user = await UserModel.findByIdAndUpdate(
      req.body.userId,
      { $set: { picture: req.file.location } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).send(user);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: err });
  }
};

module.exports.deleteProfilePic = async (req, res) => {
  // delete pic before uploading
  s3.deleteObject(
    { Bucket: bucketName, Key: req.params.filename },
    (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        res.status(200).send("Success");
        console.log(data);
      }
    }
  );
};
