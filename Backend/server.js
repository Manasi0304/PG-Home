// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const nodemailer = require("nodemailer");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// **MongoDB Connection**
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// **User Schema & Model**
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

// **Property Schema & Model**
const propertySchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  location: String,
  latitude: Number,
  longitude: Number,
  images: [String],
  tenantType: String,
  rentingOption: String,
  services: [String],
});

const Property = mongoose.model("Property", propertySchema);

// **Multer Configuration for Image Uploads**
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// **Authentication Middleware**
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// **User Registration API**
app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.json({ message: "✅ Registration successful!" });
  } catch (error) {
    res.status(500).json({ error: "❌ Registration failed" });
  }
});

// **User Login API**
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "❌ Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "✅ Login successful!", token });
  } catch (error) {
    res.status(500).json({ error: "❌ Login failed" });
  }
});

// **Forgot Password API (Email Sending)**
app.post("/reset_password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "❌ Email not found" });

    // **Create a reset token**
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // **Send email using Nodemailer**
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
    });

    res.json({ message: "📧 Password reset link sent to your email." });
  } catch (error) {
    res.status(500).json({ error: "❌ Error sending password reset email" });
  }
});

// **Reset Password API**
app.post("/reset_password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword });
    res.json({ message: "✅ Password reset successfully!" });
  } catch (error) {
    res.status(400).json({ error: "❌ Invalid or expired token" });
  }
});

// **API to Get All Properties** (Public)
app.get("/api/properties", async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: "❌ Error fetching properties" });
  }
});

// **API to Get Property by ID** (Protected)
app.get("/api/properties/:id", authenticate, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "❌ Property not found" });

    res.json(property);
  } catch (error) {
    res.status(500).json({ error: "❌ Error fetching property" });
  }
});

// **API to Add Property with Image Upload** (Protected)
app.post(
  "/api/properties",
  authenticate,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { title, description, price, location, tenantType, rentingOption, services } =
        req.body;

      // **Get Latitude & Longitude from OpenStreetMap API**
      const geoResponse = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { q: location, format: "json", limit: 1 },
      });

      if (geoResponse.data.length === 0) {
        return res.status(400).json({ message: "❌ Invalid location. Try again." });
      }

      const { lat, lon } = geoResponse.data[0];

      const newProperty = new Property({
        title,
        description,
        price,
        location,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        images: req.files.map((file) => `/uploads/${file.filename}`),
        tenantType,
        rentingOption,
        services: services ? services.split(",") : [],
      });

      await newProperty.save();
      res.json({ message: "✅ Property added successfully!", property: newProperty });
    } catch (error) {
      res.status(500).json({ error: "❌ Error adding property" });
    }
  }
);

// **Start the Server**
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
