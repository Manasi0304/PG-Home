import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./NewPropertyDetails.css";

function NewPropertyDetails() {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/properties/${id}`)
            .then(response => {
                setProperty(response.data);
                setSelectedImage(response.data.images[0]); // Default to first image
            })
            .catch(error => console.error("❌ Error fetching property details:", error));
    }, [id]);

    if (!property) return <h2>Loading...</h2>;

    return (
        <div className="property-details">
            <h1>{property.title}</h1>
            <div className="property-images">
                <img src={`http://localhost:5000${selectedImage}`} alt="Selected" className="main-image" />
                <div className="thumbnail-container">
                    {property.images.map((img, index) => (
                        <img 
                            key={index} 
                            src={`http://localhost:5000${img}`} 
                            alt="Property" 
                            className="thumbnail" 
                            onClick={() => setSelectedImage(img)} 
                        />
                    ))}
                </div>
            </div>
            <p><strong>Description:</strong> {property.description}</p>
            <p><strong>Price:</strong> 💰 ${property.price}</p>
            <p><strong>Location:</strong> 📍 {property.location}</p>
            <p><strong>Tenant Type:</strong> {property.tenantType}</p>
            <p><strong>Renting Option:</strong> {property.rentingOption}</p>
            <p><strong>Services Included:</strong> {property.services.length > 0 ? property.services.join(", ") : "None"}</p>
        </div>
    );
}

export default NewPropertyDetails;
