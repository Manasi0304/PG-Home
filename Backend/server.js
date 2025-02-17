const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// **Connect to MongoDB**
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// **User Schema & Model**
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, required: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
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

// **Nodemailer Configuration**
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// **Generate OTP Function**
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// **Send OTP Function**
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

// **User Registration - Step 1 (Send OTP)**
app.post("/register/send-otp", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "❌ All fields are required" });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "❌ Email already exists" });
    }

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await User.create({ firstName, lastName, email, password: hashedPassword, otp, otpExpires });

    await sendOTP(email, otp);
    res.json({ message: "📧 OTP sent to your email." });

  } catch (error) {
    console.error("❌ Error in /register/send-otp:", error);
    res.status(500).json({ message: "❌ Error sending OTP" });
  }
});

// **User Registration - Step 2 (Verify OTP & Create Account)**
app.post("/register/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "❌ Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "✅ Account verified successfully!" });
  } catch (error) {
    res.status(500).json({ message: "❌ OTP verification failed" });
  }
});

// **User Login**
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "❌ Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "❌ Account not verified. Please verify via OTP." });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "✅ Login successful!", token });
  } catch (error) {
    res.status(500).json({ message: "❌ Login failed" });
  }
});

// **Forgot Password - Step 1 (Send OTP)**
app.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "❌ Email not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTP(email, otp);
    res.json({ message: "📧 OTP sent to reset your password." });
  } catch (error) {
    res.status(500).json({ message: "❌ Error sending OTP" });
  }
});

// **Forgot Password - Step 2 (Reset Password)**
app.post("/forgot-password/reset", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "❌ Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "✅ Password reset successfully!" });
  } catch (error) {
    res.status(500).json({ message: "❌ Error resetting password" });
  }
});

// **Start Server**
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
