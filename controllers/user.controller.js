const UserModel = require("../models/user.model.js");

module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select("-password");
  res.status(200).json(users);
};

module.exports.userInfo = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(400).json("User not found");
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    // new: true = returns doc after update
    // upsert: true = update or insert if not already created
    await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          bio: req.body.bio,
        },
      },
      { new: true, upsert: true }
    );
    res.status(200).json("User bio updated successfully");
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    await UserModel.remove({ _id: req.params.id });
    res.status(200).json({ message: "User successfully deleted" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.follow = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    const userToFollow = await UserModel.findById(req.body.idToFollow);
    if (user && userToFollow) {
      // addToSet = add to following if it does already contain the id
      await UserModel.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { following: req.body.idToFollow } },
        { new: true, upsert: true }
      );
      // add to followers list
      await UserModel.findByIdAndUpdate(
        req.body.idToFollow,
        { $addToSet: { followers: req.params.id } },
        { new: true, upsert: true }
      );

      res.status(200).json(user);
    } else {
      res.status(400).json("User not found");
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

module.exports.unfollow = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    const userToUnfollow = await UserModel.findById(req.body.idToUnfollow);
    if (user && userToUnfollow) {
      // pull = remove
      await UserModel.findByIdAndUpdate(
        req.params.id,
        { $pull: { following: req.body.idToUnfollow } },
        { new: true, upsert: true }
      );
      // add to followers list
      await UserModel.findByIdAndUpdate(
        req.body.idToUnfollow,
        { $pull: { followers: req.params.id } },
        { new: true, upsert: true }
      );
      res.status(200).json(user);
    } else {
      res.status(400).json("User not found");
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err });
  }
};
