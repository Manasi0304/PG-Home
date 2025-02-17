// src/pages/AddNewProperty.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddNewProperty.css";

function AddNewProperty() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    images: [],
    tenantType: "",
    rentingOption: "",
    services: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === "images") {
      setFormData({
        ...formData,
        images: [...e.target.files],
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    for (let key in formData) {
      if (key === "images") {
        formData.images.forEach((image) => data.append("images", image));
      } else {
        data.append(key, formData[key]);
      }
    }

    try {
      await axios.post("http://localhost:5000/api/properties", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("✅ Property added successfully!");
      navigate("/");
    } catch (error) {
      console.error("❌ Error adding property:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-property-form">
      <h2>Add New Property</h2>
      <input
        type="text"
        name="title"
        placeholder="Title"
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        onChange={handleChange}
        required
      ></textarea>
      <input
        type="number"
        name="price"
        placeholder="Price"
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="location"
        placeholder="Location"
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="tenantType"
        placeholder="Tenant Type"
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="rentingOption"
        placeholder="Renting Option"
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="services"
        placeholder="Services (comma-separated)"
        onChange={handleChange}
        required
      />
      <input
        type="file"
        name="images"
        multiple
        accept="image/*"
        onChange={handleChange}
        required
      />
      <button type="submit">Add Property</button>
    </form>
  );
}

export default AddNewProperty;
