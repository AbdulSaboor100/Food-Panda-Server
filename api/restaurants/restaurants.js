import express from "express";
import User from "../../modals/User/User.js";
import Restaurant from "../../modals/Restaurants/Restaurants.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "config";
import authController from "../../middleware/authController.js";
import mongoose from "mongoose";
import { isEmpty } from "../../functions/functions.js";

const router = express();
const secretJwtKey = config.get("jwtSecret");

router.post("/add-restaurant", authController, async (req, res) => {
  try {
    let { name, restaurantStatus, location, image, city } = req.body;
    if (isEmpty(name)) {
      return res.status(400).json({ success: false, status: "Name not found" });
    }
    if (isEmpty(image)) {
      return res
        .status(400)
        .json({ success: false, status: "Image not found" });
    }
    if (isEmpty(city)) {
      return res.status(400).json({
        success: false,
        status: "City not found",
      });
    }
    if (!location) {
      return res
        .status(400)
        .json({ success: false, status: "Lat Or Long not found" });
    } else if (location?.coordinates) {
      if (!location?.coordinates[0] && !location?.coordinates[1]) {
        return res.status(400).json({
          success: false,
          status: "Lat Or Long not found",
        });
      }
    } else {
      return res
        .status(400)
        .json({ success: false, status: "Lat Or Long not found" });
    }
    let user = await User.findOne({ user: req.user.id });
    if (user.userType !== "ADMIN") {
      return res
        .status(400)
        .json({ success: false, status: "Token is invalid" });
    }
    let restaurant = new Restaurant({
      name,
      restaurantStatus,
      location,
      image,
      user: req.user.id,
      city: city?.toUpperCase(),
    });
    await restaurant.save();
    res
      .status(200)
      .json({ success: true, status: "Restaurant created", restaurant });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.message, error: error });
    console.log(error);
  }
});

router.put("/update-restaurant/:id", authController, async (req, res) => {
  try {
    let id = req.params.id;
    let updateBody = req.body;
    let restaurant = await Restaurant.findOne({ _id: id });
    if (!restaurant) {
      return res
        .status(400)
        .json({ success: false, status: "Restaurant not found" });
    }
    restaurant = await Restaurant.findOneAndUpdate(
      { _id: id },
      { ...updateBody }
    );
    res
      .status(200)
      .json({ success: true, status: "Restaurant updated", restaurant });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.message, error: error });
    console.log(error);
  }
});

router.delete("/delete-restaurant/:id", authController, async (req, res) => {
  try {
    let { id } = req.params;
    let user = req.user?.id;
    let restaurant = await Restaurant.findById({ _id: id });
    if (String(restaurant?.user) !== String(mongoose.Types.ObjectId(user))) {
      return res.status(400).json({
        success: false,
        status: "You are not the owner of this restaurant",
      });
    }
    if (!restaurant) {
      return res
        .status(400)
        .json({ success: false, status: "Restaurant not found" });
    }
    await Restaurant.deleteOne({ _id: id });
    res.status(200).json({ success: true, status: "Restaurant Deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.message, error: error });
    console.log(error);
  }
});

router.get("/my-restaurant", authController, async (req, res) => {
  try {
    let user = req.user.id;
    let restaurant = await Restaurant.find({ user });
    if (!restaurant) {
      return res
        .status(400)
        .json({ success: false, status: "Restaurant not found" });
    }
    res
      .status(200)
      .json({ success: true, status: "Restaurant Fetched", restaurant });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.message, error: error });
    console.log(error);
  }
});

router.get("/all-restaurant/:id", async (req, res) => {
  try {
    let { id } = req?.params;
    let city = id?.toUpperCase();
    let restaurant = await Restaurant.find({ city });
    if (!restaurant[0]) {
      return res
        .status(400)
        .json({ success: false, status: "Restaurants not found" });
    }
    res
      .status(200)
      .json({ success: true, status: "Restaurants Fetched", restaurant });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.message, error: error });
    console.log(error);
  }
});

router.get("/single-restaurant", authController, async (req, res) => {
  try {
    let user = req?.user?.id;
    let restaurant = await Restaurant.find({ user });
    if (!user) {
      return res.status(400).json({ success: false, status: "Id not found" });
    }
    if (!restaurant[0]) {
      return res
        .status(400)
        .json({ success: false, status: "Restaurant not found" });
    }
    res
      .status(200)
      .json({ success: true, status: "Restaurant fetched", restaurant });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: "Restaurant not found", error: error });
    console.log(error);
  }
});

router.get("/get-restaurant/:id", authController, async (req, res) => {
  try {
    let { id } = req.params;
    let restaurant = await Restaurant.findOne({ _id: id });
    if (!id) {
      return res.status(400).json({ success: false, status: "Id not found" });
    }
    if (!restaurant) {
      return res
        .status(400)
        .json({ success: false, status: "Restaurant not found" });
    }
    res
      .status(200)
      .json({ success: true, status: "Restaurant fetched", restaurant });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: "Restaurant not found", error: error });
    console.log(error);
  }
});

export default router;
