const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Route = require("./models/Route");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

/* ──────── USER ROUTES ──────── */

// Register
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, dateOfBirth } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      username,
      email,
      password: hashedPassword,
      dateOfBirth,
      followers: 0,
      following: 0,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      userId: user._id,
      username: user.username,
      followers: user.followers,
      following: user.following
    });
  } catch (err) {
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
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
app.put("/user/:id", async (req, res) => {
  const { username, profileImage } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, profileImage },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────── ROUTE ROUTES ──────── */

// Save a route
app.post("/routes", async (req, res) => {
  const { userId, routePoints, isDraft, title, description } = req.body;

  if (!userId || !Array.isArray(routePoints)) {
    return res.status(400).json({ message: "Invalid route data" });
  }

  try {
    const newRoute = new Route({ userId, routePoints, isDraft, title, description });
    await newRoute.save();
    res.status(201).json({ message: "Route saved", route: newRoute });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update a route
app.put("/routes/:id", async (req, res) => {
  const { title, description, routePoints } = req.body;

  try {
    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id,
      { title, description, routePoints },
      { new: true }
    );

    if (!updatedRoute) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.json({ message: "Route updated", route: updatedRoute });
  } catch (error) {
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
    res.status(500).json({ message: "Server error" });
  }
});

// Get route by ID
app.get("/routes/:id", async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found" });
    res.json(route);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ──────── SERVER ──────── */
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});
