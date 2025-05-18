// backend/models/Route.js
const mongoose = require("mongoose");

// sub‐schema for a single comment
const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const RouteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  routePoints: [
    {
      latitude: Number,
      longitude: Number
    }
  ],
  title: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  placeNames: [String],
  isDraft: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },

  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  comments: [CommentSchema]
});

module.exports = mongoose.model("Route", RouteSchema);
