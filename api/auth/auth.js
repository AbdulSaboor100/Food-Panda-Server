import express from "express";
import User from "../../modals/User/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "config";
import {
  hashPassword,
  comparePassword,
  isEmail,
  isEmpty,
  isLength,
} from "../../functions/functions.js";
import authController from "../../middleware/authController.js";

const router = express();
const secretJwtKey = config.get("jwtSecret");

router.post("/register", async (req, res) => {
  try {
    let { email, password, name } = req.body;
    if (isEmpty(email)) {
      return res
        .status(400)
        .json({ success: false, status: "Email not found" });
    }
    if (isEmpty(password)) {
      return res
        .status(400)
        .json({ success: false, status: "Password not found" });
    }
    if (isEmpty(name)) {
      return res.status(400).json({ success: false, status: "Name not found" });
    }
    if (!isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, status: "Email not valid", email });
    }
    if (isLength(password)) {
      return res.status(400).json({
        success: false,
        status: "Password is less then 6 characters",
      });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, status: "User already existed" });
    }
    user = new User({
      email,
      password: await hashPassword(password),
      usertype: "CLIENT",
      name,
    });
    await user.save();
    let payload = {
      id: user._id,
    };
    jwt.sign(payload, secretJwtKey, { expiresIn: "1h" }, (err, token) => {
      if (err) {
        throw err;
      } else {
        res
          .status(200)
          .json({ success: true, status: "Register successfully", token });
      }
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, status: error?.response, error: error });
  }
});

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (isEmpty(email)) {
      return res
        .status(400)
        .json({ success: false, status: "Email not found" });
    }
    if (isEmpty(password)) {
      return res
        .status(400)
        .json({ success: false, status: "Password not found" });
    }
    if (!isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, status: "Email not valid", email });
    }
    if (isLength(password)) {
      return res.status(400).json({
        success: false,
        status: "Password is less then 6 characters",
      });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, status: "User not exits" });
    }
    let isPassword = await comparePassword(user?.password, password);
    if (!isPassword) {
      return res
        .status(400)
        .json({ success: false, status: "Invalid password" });
    }
    let payload = {
      id: user._id,
    };
    jwt.sign(payload, secretJwtKey, { expiresIn: "1h" }, (err, token) => {
      if (err) {
        throw err;
      } else {
        res
          .status(200)
          .json({ success: true, status: "Login successfully", token });
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.response, error: error });
    console.log(error);
  }
});

router.post("/is-email", async (req, res) => {
  try {
    let { email } = req.body;
    if (isEmpty(email)) {
      return res
        .status(400)
        .json({ success: false, status: "Email not valid or empty" });
    }
    if (!isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, status: "Email not found", email });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: false,
        status: "Email not found",
        isRegistered: false,
      });
    }
    res.status(200).json({
      success: true,
      status: "Email found",
      isRegistered: true,
      email: user?.email,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.response, error: error });
    console.log(error);
  }
});

router.post("/current-user", authController, async (req, res) => {
  try {
    let id = req?.user?.id;
    let user = await User.findOne({ _id: id }).select("-password");
    if (!user) {
      return res.status(400).json({ success: false, status: "User not found" });
    }
    let payload = {
      id: user._id,
    };
    jwt.sign(payload, secretJwtKey, { expiresIn: "1h" }, (err, token) => {
      if (err) {
        throw err;
      } else {
        res.status(200).json({
          success: true,
          status: "User fetched successfully",
          user,
          token,
        });
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.response, error: error });
    console.log(error);
  }
});

export default router;
