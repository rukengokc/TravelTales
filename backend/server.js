// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const User = require("./models/User");
const Route = require("./models/Route");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Simple request logger
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.path}`);
  next();
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

/** ──────── USER ROUTES ──────── **/

// Register
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, dateOfBirth, role } = req.body;

    // 🔐 Optional: Prevent frontend from setting role directly unless you're testing
    const user = new User({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      dateOfBirth: new Date(dateOfBirth),
      role: role === "admin" ? "admin" : "user"
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});


// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({
      token,
      userId: user._id,
      username: user.username,
      role: user.role,
      followers: user.followers,
      following: user.following
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user profile
app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update user profile — updated to include email & DOB
app.put("/user/:id", async (req, res) => {
  try {
    const { username, email, dateOfBirth, profileImage } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, dateOfBirth, profileImage },
      { new: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated successfully", user: updated });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** ──────── ROUTE ROUTES ──────── **/

// helper: reverse‐geocode a lat/lng to a formatted address
async function reverseGeocode(lat, lng) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`;
  const { data } = await axios.get(url);
  if (data.results && data.results[0]) {
    return data.results[0].formatted_address;
  }
  return null;
}

// Save a route (and pre‐geocode start & end)
app.post("/routes", async (req, res) => {
  try {
    const { userId, routePoints, isDraft, title, description } = req.body;
    if (!userId || !Array.isArray(routePoints) || routePoints.length === 0) {
      return res.status(400).json({ message: "Invalid route data" });
    }

    // create initial document
    let newRoute = new Route({ userId, routePoints, isDraft, title, description });
    newRoute = await newRoute.save();

    // pick start & end to geocode
    const start = routePoints[0];
    const end = routePoints[routePoints.length - 1];
    const placeNames = [];
    try {
      const startName = await reverseGeocode(start.latitude, start.longitude);
      if (startName) placeNames.push(startName);
      if (end && (end.latitude !== start.latitude || end.longitude !== start.longitude)) {
        const endName = await reverseGeocode(end.latitude, end.longitude);
        if (endName) placeNames.push(endName);
      }
    } catch (geoErr) {
      console.error("Reverse geocode failed:", geoErr);
    }

    // update with placeNames
    newRoute.placeNames = placeNames;
    newRoute = await newRoute.save();

    res.status(201).json({ message: "Route saved", route: newRoute });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a route
app.put("/routes/:id", async (req, res) => {
  try {
    const { title, description, routePoints } = req.body;
    const updated = await Route.findByIdAndUpdate(
      req.params.id,
      { title, description, routePoints },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Route not found" });
    res.json({ message: "Route updated", route: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user’s shared/draft routes
app.get("/routes", async (req, res) => {
  const { userId, isDraft } = req.query;
  if (!userId) return res.status(400).json({ message: "User ID is required" });
  try {
    const routes = await Route.find({ userId, isDraft: isDraft === "true" });
    res.json(routes);
  } catch (err) {
    console.error("Error fetching routes:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Fallback: get all raw routes
app.get("/routes/all", async (req, res) => {
  console.log("🟦 Entered /routes/all");
  try {
    const routes = await Route.find({});
    console.log("🟩 Raw routes:", routes.length);
    res.json(routes);
  } catch (err) {
    console.error("🟥 /routes/all error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get route by ID

// Change your existing GET /routes/:id to this:
app.get("/routes/:id", async (req, res) => {
  try {
    // populate userId → user
    const route = await Route.findById(req.params.id)
    .populate("userId", "username profileImage")
    .populate("comments.user", "username profileImage");
    
    if (!route) return res.status(404).json({ message: "Route not found" });

    const formatted = {
      _id: route._id,
      title: route.title,
      description: route.description,
      routePoints: route.routePoints,
      placeNames: route.placeNames || [],
      createdAt: route.createdAt,
      likes: route.likes || [],
      comments: route.comments || [],

      user: {
        _id: route.userId._id,
        username: route.userId.username,
        profileImage: route.userId.profileImage || "default-profile.png",
      },
    };

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Feed: most recent 20 shared routes
app.get("/feed", async (req, res) => {
  try {
    const feed = await Route.find({ isDraft: false })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("userId", "username profileImage");

    const formatted = feed.map(r => ({
      _id: r._id,
      title: r.title,
      description: r.description,
      routePoints: r.routePoints,
      placeNames: r.placeNames || [],
      createdAt: r.createdAt,
      user: {
        _id: r.userId._id,
        username: r.userId.username,
        profileImage: r.userId.profileImage || "default-profile.png",
      }
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching feed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/** ─── Likes ─── **/
app.post("/routes/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found" });

    const idx = route.likes.findIndex(u => u.toString() === userId);
    if (idx === -1) {
      route.likes.push(userId);
    } else {
      route.likes.splice(idx, 1);
    }

    await route.save();
    return res.json({ likes: route.likes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

/** ─── Add a comment ─── **/
// Add a comment to a route
app.post("/routes/:id/comment", async (req, res) => {
  try {
    const { userId, text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Comment text required" });
    }

    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    const newComment = route.comments.create({ user: userId, text });
    route.comments.push(newComment);
    await route.save();
    await route.populate("comments.user", "username profileImage");

    const populatedComment = route.comments.id(newComment._id);
    return res.status(201).json(populatedComment);

  } catch (err) {
    console.error("Error in /routes/:id/comment:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


/** ─── Delete a comment ─── **/
app.delete("/routes/:id/comment/:commentId", async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.body.userId || req.query.userId; // Support body or query

    const route = await Route.findById(id);
    if (!route) return res.status(404).json({ message: "Route not found" });

    const comment = route.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const routeOwnerId = route.user?.toString?.();
    const commenterId = comment.user?.toString?.();

    const isOwner = routeOwnerId === userId;
    const isCommenter = commenterId === userId;

    if (!isOwner && !isCommenter) {
      return res.status(403).json({ message: "Not authorized" });
    }

    route.comments.pull(commentId);
    await route.save();

    return res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Follow a user
app.post("/users/:id/follow", async (req, res) => {
  const { id: targetId } = req.params;
  const { userId } = req.body; // user who wants to follow

  if (userId === targetId) return res.status(400).json({ message: "Cannot follow yourself" });

  const user = await User.findById(userId);
  const target = await User.findById(targetId);

  if (!user || !target) return res.status(404).json({ message: "User not found" });

  if (!user.following.includes(targetId)) {
    user.following.push(targetId);
    target.followers.push(userId);

    await user.save();
    await target.save();
  }

  res.json({ message: "Followed successfully" });
});


// Unfollow a user
app.post("/users/:id/unfollow", async (req, res) => {
  const { id: targetId } = req.params;
  const { userId } = req.body;

  const user = await User.findById(userId);
  const target = await User.findById(targetId);

  if (!user || !target) return res.status(404).json({ message: "User not found" });

  user.following = user.following.filter(f => f.toString() !== targetId);
  target.followers = target.followers.filter(f => f.toString() !== userId);

  await user.save();
  await target.save();

  res.json({ message: "Unfollowed successfully" });
});

// ✅ List all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete a user
app.delete("/users/:id", async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update a user's role
app.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }
    const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Role updated", user: updated });
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete a route by ID
app.delete("/routes/:id", async (req, res) => {
  try {
    const result = await Route.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Route not found" });
    res.json({ message: "Route deleted" });
  } catch (err) {
    console.error("Error deleting route:", err);
    res.status(500).json({ message: "Server error" });
  }
});




/* ──────── START SERVER ──────── */
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});
