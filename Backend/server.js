const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // ✅ Serves images correctly

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Property Schema & Model
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

// Multer Configuration for Image Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// ✅ API to Get All Properties
app.get("/api/properties", async (req, res) => {
    try {
        const properties = await Property.find();
        res.json(properties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ API to Get Property by ID
app.get("/api/properties/:id", async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ message: "Property not found" });
        res.json(property);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ API to Add Property with Image Upload & Geolocation
app.post("/api/properties", upload.array("images", 5), async (req, res) => {
    try {
        const { title, description, price, location, tenantType, rentingOption, services } = req.body;

        // Get Latitude & Longitude from OpenStreetMap API
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
            images: req.files.map(file => `/uploads/${file.filename}`),
            tenantType,
            rentingOption,
            services: services ? services.split(",") : [],
        });

        await newProperty.save();
        res.json({ message: "✅ Property added successfully!", property: newProperty });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
