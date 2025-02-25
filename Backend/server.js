const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`✅ MongoDB Connected to ${mongoose.connection.name}`))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
});

const User = mongoose.model("User", userSchema);

// Property Schema
const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  location: { type: String, required: true },
  images: [String],
  tenantType: String,
  rentingOption: String,
  services: [String],
  createdAt: { type: Date, default: Date.now },
});

const Property = mongoose.model("Property", propertySchema);

// Multer Storage for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper Functions
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification",
      html: `<p>Your OTP for verification is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
    });
    console.log(`📧 OTP sent to ${email}: ${otp}`);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new Error("Error sending OTP email");
  }
};

const generateToken = (user) => jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) return res.status(401).json({ alert: "❌ No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ alert: "❌ Unauthorized - Invalid or expired token" });
    req.userId = decoded.id;
    next();
  });
};

// Register User and Send OTP
app.post("/register/send-otp", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) return res.status(400).json({ alert: "❌ All fields are required" });

    if (await User.findOne({ email })) return res.status(400).json({ alert: "❌ Email already exists" });

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await User.create({ firstName, lastName, email, password: hashedPassword, otp, otpExpires });
    await sendOTP(email, otp);

    res.json({ alert: "📧 OTP sent to your email." });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ alert: "❌ Error sending OTP" });
  }
});

// Verify OTP
app.post("/register/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) return res.status(400).json({ alert: "❌ Invalid or expired OTP" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ alert: "✅ Account verified successfully!" });
  } catch (error) {
    console.error("❌ OTP verification failed:", error);
    res.status(500).json({ alert: "❌ OTP verification failed" });
  }
});

// User Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ alert: "❌ Invalid credentials" });
    if (!user.isVerified) return res.status(400).json({ alert: "❌ Account not verified" });

    const token = generateToken(user);
    res.json({ alert: "✅ Login successful!", token });
  } catch (error) {
    console.error("❌ Login failed:", error);
    res.status(500).json({ alert: "❌ Login failed" });
  }
});

// Add Property (protected route)
app.post("/api/properties", verifyToken, upload.array("images"), async (req, res) => {
  try {
    const { title, price, location } = req.body;
    if (!title || !price || !location) return res.status(400).json({ alert: "❌ Missing required fields" });

    const images = req.files.map((file) => `/uploads/${file.filename}`);
    const newProperty = new Property({ ...req.body, images });

    await newProperty.save();
    res.status(201).json({ alert: "✅ Property added successfully!" });
  } catch (error) {
    console.error("❌ Failed to add property:", error);
    res.status(500).json({ alert: "❌ Failed to add property" });
  }
});

// Get All Properties
app.get("/api/properties", async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    console.error("❌ Failed to fetch properties:", error);
    res.status(500).json({ alert: "❌ Failed to fetch properties" });
  }
});

// Server Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
