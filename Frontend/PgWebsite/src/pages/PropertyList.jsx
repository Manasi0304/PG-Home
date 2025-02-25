import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PropertyFilters from "./PropertyFilters"; // Import the new filter component
import "./PropertyList.css";

function PropertyList() {
    const [properties, setProperties] = useState([]);
    const [search, setSearch] = useState("");
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [filters, setFilters] = useState({
        locality: "",
        budget: "",
        tenantType: "",
        rentingOption: [],
        services: [],
    });

    useEffect(() => {
        fetchProperties();
    }, [filters]);

    const fetchProperties = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/properties", {
                params: {
                    locality: filters.locality || undefined,
                    budget: filters.budget || undefined,
                    tenantType: filters.tenantType || undefined,
                    rentingOption: filters.rentingOption.length ? filters.rentingOption : undefined,
                    services: filters.services.length ? filters.services : undefined,
                }
            });
            setProperties(response.data);
        } catch (error) {
            console.error("❌ Error fetching properties:", error);
        }
    };

    useEffect(() => {
        const updatedProperties = properties.filter(property =>
            property.title.toLowerCase().includes(search.toLowerCase()) ||
            property.location.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredProperties(updatedProperties);
    }, [search, properties]);

    return (
        <div className="property-list">
            <h1>🏡 Available Properties</h1>
            <input
                type="text"
                placeholder="🔍 Search property..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-bar"
            />

            {/* Integrating the separate PropertyFilters component */}
            <PropertyFilters filters={filters} setFilters={setFilters} />

            <div className="property-grid">
                {filteredProperties.length ? (
                    filteredProperties.map((property) => (
                        <div className="property-card" key={property._id}>
                            <img src={`http://localhost:5000${property.images[0]}`} alt={property.title} />
                            <h3>{property.title}</h3>
                            <p>📍 {property.location}</p>
                            <p>💰 ₹{property.price}</p>
                            <Link to={`/property/${property._id}`}>View Details</Link>
                        </div>
                    ))
                ) : (
                    <p>❌ No properties found</p>
                )}
            </div>
        </div>
    );
}

export default PropertyList;