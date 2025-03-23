const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Route = require('./models/Route');


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))


// User Registration
app.post("/register", async (req, res) => {
    try {
        const { username, email, password, dateOfBirth } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            email,
            password: hashedPassword,
            dateOfBirth,
        });

        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


// User Login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, userId: user._id, username: user.username });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Save a route
app.post('/routes', async (req, res) => {
    const { userId, routePoints, isDraft } = req.body;
  
    if (!userId || !Array.isArray(routePoints)) {
      return res.status(400).json({ message: 'Invalid route data' });
    }
  
    try {
      const newRoute = new Route({ userId, routePoints, isDraft });
      await newRoute.save();
      res.status(201).json({ message: 'Route saved successfully', route: newRoute });
    } catch (error) {
      console.error('Error saving route:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

  const PORT = process.env.PORT || 5001;
  const HOST = process.env.HOST || '0.0.0.0';
  
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  });
  