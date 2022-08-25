import mongoose from "mongoose";
import Schema from "mongoose";

let restaurantSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
  },
  image: {
    type: String,
  },
  location: {
    type: { type: String },
    coordinates: [Number],
  },
  name: {
    type: String,
  },
  city: {
    type: String,
  },
  restaurantStatus: {
    type: Boolean,
  },
  rating: {
    type: String,
  },
  fooditems: [
    {
      name: {
        type: String,
      },
      items: [
        {
          image: {
            type: String,
          },
          title: {
            type: String,
          },
          description: {
            type: String,
          },
          price: {
            type: String,
          },
        },
      ],
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

let Restaurant = mongoose.model("restaurant", restaurantSchema);

export default Restaurant;
