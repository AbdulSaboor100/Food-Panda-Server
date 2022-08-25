import express from "express";
import User from "../../modals/User/User.js";
import Restaurant from "../../modals/Restaurants/Restaurants.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "config";
import authController from "../../middleware/authController.js";

const router = express();
const secretJwtKey = config.get("jwtSecret");

router.post("/add-restaurant", authController, async (req, res) => {
  try {
    let user = await User.findOne({ user: req.user.id });
    if (user.usertype !== "ADMIN") {
      return res
        .status(400)
        .json({ success: false, status: "Token is invalid" });
    }
    let { name, restaurantStatus, location, image, city } = req.body;
    let restaurant = new Restaurant({
      name,
      restaurantStatus,
      location,
      image,
      user: req.user.id,
      city,
    });
    await restaurant.save();
    res
      .status(200)
      .json({ success: true, status: "Restaurant created", restaurant });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.response, error: error });
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
      .json({ success: false, status: error?.response, error: error });
    console.log(error);
  }
});

export default router;
