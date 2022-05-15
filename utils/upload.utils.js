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

module.exports.upload = multer({
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
